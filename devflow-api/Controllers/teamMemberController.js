
import { Team, TeamMember, User } from "../models/associations.js";

const getTeamMembers = async (req, res) => {
  try {
    const teamId = Number(req.params.teamId);

    if (!Number.isInteger(teamId) || teamId < 1) {
      return res.status(400).json({
        status: false,
        message: "Invalid team ID",
      });
    }

    const currentMembership = await TeamMember.findOne({
      where: {
        teamId,
        userId: req.user.id,
      },
    });

    if (!currentMembership) {
      return res.status(403).json({
        status: false,
        message: "You are not a member of this team",
      });
    }

    const members = await TeamMember.findAll({
      where: { teamId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json({
      status: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get team members error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const teamId = Number(req.params.teamId);
    const { email } = req.body;

    if (!Number.isInteger(teamId) || teamId < 1) {
      return res.status(400).json({
        status: false,
        message: "Invalid team ID",
      });
    }

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const currentMembership = await TeamMember.findOne({
      where: {
        teamId,
        userId: req.user.id,
      },
    });

    if (!currentMembership) {
      return res.status(403).json({
        status: false,
        message: "You are not a member of this team",
      });
    }

    if (!["owner", "admin"].includes(currentMembership.role)) {
      return res.status(403).json({
        status: false,
        message: "Only owners and admins can add team members",
      });
    }

    const team = await Team.findByPk(teamId);

    if (!team) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
      });
    }

    const user = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "No registered user found with that email",
      });
    }

    const existingMembership = await TeamMember.findOne({
      where: {
        teamId,
        userId: user.id,
      },
    });

    if (existingMembership) {
      return res.status(409).json({
        status: false,
        message: "This user is already a member of the team",
      });
    }

    const membership = await TeamMember.create({
      teamId,
      userId: user.id,
      role: "member",
    });

    return res.status(201).json({
      status: true,
      message: "Team member added successfully",
      membership: {
        id: membership.id,
        teamId: membership.teamId,
        userId: membership.userId,
        role: membership.role,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Add team member error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export { getTeamMembers, addTeamMember };
