
import { Team, TeamMember } from "../models/associations.js";
import { Project } from "../models/Project.js";

const createTeam = async (req, res) => {
  const transaction = await Team.sequelize.transaction();

  try {
    const { name, description } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        message: "Team name is required",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      await transaction.rollback();
      return res.status(400).json({
        status: false,
        message: "Description must be a string",
      });
    }

    const team = await Team.create(
      {
        name: name.trim(),
        description: description?.trim() || null,
      },
      { transaction }
    );

    await TeamMember.create(
      {
        teamId: team.id,
        userId: req.user.id,
        role: "owner",
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Create team error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const memberships = await TeamMember.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Team,
          include: [
            {
              model: Project,
              attributes: ["id", "name", "description", "status"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const teams = memberships.map((membership) => membership.Team);

    return res.status(200).json({
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error("Fetch teams error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const getTeamById = async (req, res) => {
  try {
    const membership = await TeamMember.findOne({
      where: {
        teamId: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: Team,
          include: [
            {
              model: Project,
              attributes: ["id", "name", "description", "status"],
            },
          ],
        },
      ],
    });

    if (!membership || !membership.Team) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
      });
    }

    return res.status(200).json({
      status: true,
      team: membership.Team,
    });
  } catch (error) {
    console.error("Fetch team error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const updateTeam = async (req, res) => {
  try {
    const { description } = req.body;

    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({
        status: false,
        message: "Description is required",
      });
    }

    const membership = await TeamMember.findOne({
      where: {
        teamId: req.params.id,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
      });
    }

    if (!["owner", "admin"].includes(membership.role)) {
      return res.status(403).json({
        status: false,
        message: "Only team owners and admins can update this team",
      });
    }

    const team = await Team.findByPk(req.params.id);

    await team.update({ description: description.trim() });

    return res.status(200).json({
      status: true,
      message: "Team updated successfully",
      team,
    });
  } catch (error) {
    console.error("Update team error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const membership = await TeamMember.findOne({
      where: {
        teamId: req.params.id,
        userId: req.user.id,
      },
    });

    if (!membership) {
      return res.status(404).json({
        status: false,
        message: "Team not found",
      });
    }

    if (membership.role !== "owner") {
      return res.status(403).json({
        status: false,
        message: "Only the team owner can delete this team",
      });
    }

    const team = await Team.findByPk(req.params.id);

    await team.destroy();

    return res.status(200).json({
      status: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Delete team error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export {
  createTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};
