import {
    Activity,
    Issue,
    User,
    ProjectMember
} from "../models/associations.js";

const getActivities = async (req, res) => {
    try {
        const { issueId } = req.params;

        // 1. Find the issue
        const issue = await Issue.findByPk(issueId);

        if (!issue) {
            return res.status(404).json({
                status: false,
                message: "Issue not found"
            });
        }

        // 2. Check project membership
        const membership = await ProjectMember.findOne({
            where: {
                projectId: issue.projectId,
                userId: req.user.id
            }
        });

        if (!membership) {
            return res.status(403).json({
                status: false,
                message: "You are not a member of this project"
            });
        }

        // 3. Retrieve activities
        const activities = await Activity.findAll({
            where: {
                issueId: issue.id
            },
            include: [{
                model: User,
                attributes: ["id", "name"]
            }],
            order: [["createdAt", "DESC"]]
        });

        // 4. Return response
        return res.status(200).json({
            status: true,
            count: activities.length,
            activities
        });

    } catch (error) {
        console.error("Get activities error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to retrieve activities"
        });
    }
};


const getAllActivities = async (req, res) => {
  try {
    const memberships = await ProjectMember.findAll({
      where: { userId: req.user.id },
      attributes: ["projectId"],
    });

    const projectIds = memberships.map(
      (membership) => membership.projectId
    );

    const issues = await Issue.findAll({
      where: { projectId: projectIds },
      attributes: ["id"],
    });

    const issueIds = issues.map((issue) => issue.id);

    const activities = await Activity.findAll({
      where: { issueId: issueIds },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
        {
          model: Issue,
          attributes: ["id", "title", "projectId"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    return res.status(200).json({
      status: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get all activities error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to retrieve activities",
    });
  }
};

export { getActivities, getAllActivities };


