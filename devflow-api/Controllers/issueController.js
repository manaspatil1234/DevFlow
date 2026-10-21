
import { Issue,Project,ProjectMember,User,Activity } from "../models/associations.js";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";
const createIssue = async (req,res)=>{
    try{

        const {title,description,projectId,priority="medium",status="open"}=req.body

        if(typeof title !=='string' || title.trim().length<3){
            return res.status(400).json({
                status:false,
                message:"Please enter a valid title"
            })
        }

        const allowedPriorities =[
            "low",
            "medium",
            "high",
            "critical"
        ]

        const allowedStatuses=[
            "open",
            "in_progress",
            "in_review",
            "resolved"
        ]

        if(!allowedPriorities.includes(priority)){
            return res.status(400).json({
                status:false,
                message:"Invalid priority value"
            })
        }

            if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
        status: false,
        message: "Invalid status value",
    });
    }

        const project = await Project.findByPk(projectId)
        if(!project){
            return res.status(404).json({
                status:false,
                message:"Project doesnt exist"
            })
        }

        const membership = await ProjectMember.findOne({
    where: {
        projectId: project.id,
        userId: req.user.id
    }
});

if (!membership) {
    return res.status(403).json({
        status: false,
        message: "You are not a member of this project"
    });
}
//create the issue
        
const issue = await sequelize.transaction(async (transaction) => {
  const newIssue = await Issue.create(
    {
      title: title.trim(),
      description,
      projectId: project.id,
      createdById: req.user.id,
      priority,
      status,
    },
    { transaction }
  );

  await Activity.create(
    {
      action: "issue_created",
      description: `Issue "${newIssue.title}" was created`,
      issueId: newIssue.id,
      userId: req.user.id,
    },
    { transaction }
  );

  return newIssue;
});



        return res.status(201).json({
            status:true,
            message:"Issue created",
            issue
        })
    }catch(error){
        console.error("Create issue error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
    }
}


const getAllIssues = async (req, res) => {
  try {

    const {status,priority,type,search,projectId}=req.query

    const where ={}

    const allowedStatuses = [
        "open",
        "in_progress",
        "in_review",
        "resolved"
    ]

    if(status!==undefined && !allowedStatuses.includes(status)){
        return res.status(400).json({
            status:false,
            message:"Invalid status"
        })
    }

    if(status !==undefined){
        where.status=status
    }

    
const allowedPriorities = [
  "low",
  "medium",
  "high",
  "critical"
];

if (priority !== undefined && !allowedPriorities.includes(priority)) {
  return res.status(400).json({
    status: false,
    message: "Invalid priority"
  });
}

if (priority !== undefined) {
  where.priority = priority;
}


const allowedTypes = ["bug", "feature", "task"];

if (type !== undefined && !allowedTypes.includes(type)) {
  return res.status(400).json({
    status: false,
    message: "Invalid issue type"
  });
}

if (type !== undefined) {
  where.type = type;
}

const page = Number(req.query.page) || 1;
const limit = Number(req.query.limit) || 10

const offset = (page-1)*limit

if(
    !Number.isInteger(page)||
    page<1||
    !Number.isInteger(limit)||
    limit <1||
    limit>100
){
    return res.status(400).json({
        status:false,
        message:"Page must be a positive integer and limit must be between 1 and 100"
    })

}

if(search){
    where[Op.or]=[
        {title:{[Op.iLike]: `%${search}%`}},
        {description:{[Op.iLike]:`%${search}%`}}
    ]
}

const memberships = await ProjectMember.findAll({
  where:{
    userId:req.user.id
  },
  attributes:["projectId"]
})

const projectIds = memberships.map(membership=>membership.projectId)

where.projectId={
  [Op.in]:projectIds
}

if (projectId !== undefined) {
  const parsedProjectId = Number(projectId);

  if (!Number.isInteger(parsedProjectId) || parsedProjectId < 1) {
    return res.status(400).json({
      status: false,
      message: "Invalid project ID"
    });
  }

  where.projectId[Op.in] = [parsedProjectId];
}


    // Fetch all issues from PostgreSQL
    const {count,rows} = await Issue.findAndCountAll({
        where,
        limit,
        offset,
        order:[["createdAt","DESC"]]
    });

    // Return the issues
    return res.status(200).json({
      status: true,
      page,
      limit,
      total:count,
      totalPages:Math.ceil(count/limit),
      count: rows.length,
      issues:rows
    });

  } catch (error) {
    console.error("Fetch issues error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};


const getIssueById = async (req, res) => {
    try {
        const { id } = req.params;

        const issue = await Issue.findByPk(id);

        if (!issue) {
            return res.status(404).json({
                status: false,
                message: "Issue doesn't exist"
            });
        }

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

        return res.status(200).json({
            status: true,
            issue
        });

    } catch (error) {
        console.error("Fetch issue error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const updateIssues = async (req,res)=>{
    try{
        const {id}=req.params
        const {title,description,type,status,priority,dueDate}=req.body

        const issue = await Issue.findByPk(id)

        if(!issue){
            return res.status(404).json({
                status:false,
                message:"Issue dont exist"
            })
        }

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

        if(issue.createdById!==req.user.id){
            return res.status(403).json({
                status:false,
                message:"You are not allowed to update this issue"
            })
        }


        // Validate title if provided
if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length < 3) {
        return res.status(400).json({
            status: false,
            message: "Title must be at least 3 characters long"
        });
    }
}

// Validate priority
if (
    priority !== undefined &&
    !["low", "medium", "high", "critical"].includes(priority)
) {
    return res.status(400).json({
        status: false,
        message: "Invalid priority"
    });
}

// Validate status
if (
    status !== undefined &&
    !["open", "in_progress", "in_review", "resolved"].includes(status)
) {
    return res.status(400).json({
        status: false,
        message: "Invalid status"
    });
}

// Validate type
if (
    type !== undefined &&
    !["bug", "feature", "task"].includes(type)
) {
    return res.status(400).json({
        status: false,
        message: "Invalid issue type"
    });
}


if (dueDate !== undefined && dueDate !== null) {
    if (
        typeof dueDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ||
        Number.isNaN(Date.parse(dueDate)) ||
        new Date(`${dueDate}T00:00:00.000Z`)
            .toISOString()
            .slice(0, 10) !== dueDate
    ) {
        return res.status(400).json({
            status: false,
            message: "Due date must be a valid date in YYYY-MM-DD format"
        });
    }
}


        //capture old values before updating'

        
const previousStatus = issue.status;
const previousPriority = issue.priority;

const updates = {};

if (title !== undefined) updates.title = title.trim();
if (description !== undefined) updates.description = description;
if (type !== undefined) updates.type = type;
if (status !== undefined) updates.status = status;
if (priority !== undefined) updates.priority = priority;
if (dueDate !== undefined) updates.dueDate = dueDate;

if (Object.keys(updates).length === 0) {
  return res.status(400).json({
    status: false,
    message: "Provide at least one field to update",
  });
}

await sequelize.transaction(async (transaction) => {
  await issue.update(updates, { transaction });

  if (previousStatus !== issue.status) {
    await Activity.create(
      {
        action: "status_changed",
        description: `Status changed from ${previousStatus} to ${issue.status}`,
        issueId: issue.id,
        userId: req.user.id,
      },
      { transaction }
    );
  }

  if (previousPriority !== issue.priority) {
    await Activity.create(
      {
        action: "priority_changed",
        description: `Priority changed from ${previousPriority} to ${issue.priority}`,
        issueId: issue.id,
        userId: req.user.id,
      },
      { transaction }
    );
  }
});

        return res.status(200).json({
            status:true,
            message:"Issue updated successfully",
            issue
        })

}catch(error){
    console.error("Update issue error:", error);

    if (error.name === "SequelizeValidationError" ||
        error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        status: false,
        message: "Invalid issue data"
      });
    }

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
}
}


const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        const issue = await Issue.findByPk(id);

        if (!issue) {
            return res.status(404).json({
                status: false,
                message: "Issue doesn't exist"
            });
        }

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

        if (issue.createdById !== req.user.id) {
            return res.status(403).json({
                status: false,
                message: "You are not allowed to delete this issue"
            });
        }

        await issue.destroy();

        return res.status(200).json({
            status: true,
            message: "Issue deleted successfully"
        });

    } catch (error) {
        console.error("Delete issue error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const assignIssue = async(req,res)=>{
  try{

    const {id}=req.params
    const {assigneeId}= req.body

    const issue = await Issue.findByPk(id)

    if(!issue){
      return res.status(404).json({
        status:false,
        message:"Issue Not Found"
      })
    }

    const currentMembership = await ProjectMember.findOne({
      where:{
        projectId:issue.projectId,
        userId:req.user.id
      }
    })

    if(!currentMembership){
      return res.status(403).json({
        status:false,
        message:"You are not a member of this project"
      })
    }

    // 3. Validate the requested assignee
        if (
            assigneeId !== null &&
            (!Number.isInteger(assigneeId) || assigneeId <= 0)
        ) {
            return res.status(400).json({
                status: false,
                message: "assigneeId must be a positive integer or null"
            });
        }

      // 4. If assigning, ensure the user belongs to this project
        if (assigneeId !== null) {
            const targetMembership = await ProjectMember.findOne({
                where: {
                    projectId: issue.projectId,
                    userId: assigneeId
                }
            });

            if (!targetMembership) {
                return res.status(400).json({
                    status: false,
                    message: "Assignee must be a member of this project"
                });
            }

            const user = await User.findByPk(assigneeId);

            if (!user) {
                return res.status(404).json({
                    status: false,
                    message: "Assignee user not found"
                });
            }
        }

        //5.assign or unassign the issue

        
const previousAssigneeId = issue.assigneeId;

if (previousAssigneeId !== assigneeId) {
  await sequelize.transaction(async (transaction) => {
    let description;

    if (assigneeId === null) {
      const previousUser = previousAssigneeId
        ? await User.findByPk(previousAssigneeId, { transaction })
        : null;

      description = previousUser
        ? `Issue unassigned from ${previousUser.name}`
        : "Issue unassigned";
    } else {
      const newUser = await User.findByPk(assigneeId, { transaction });

      if (previousAssigneeId === null) {
        description = `Issue assigned to ${newUser.name}`;
      } else {
        const previousUser = await User.findByPk(
          previousAssigneeId,
          { transaction }
        );

        description = previousUser
          ? `Issue reassigned from ${previousUser.name} to ${newUser.name}`
          : `Issue assigned to ${newUser.name}`;
      }
    }

    issue.assigneeId = assigneeId;
    await issue.save({ transaction });

    await Activity.create(
      {
        action: "assignee_changed",
        description,
        issueId: issue.id,
        userId: req.user.id,
      },
      { transaction }
    );
  });
}


        return res.status(200).json({
          status:true,
          message:assigneeId===null ? "Issue unassigned successfully":
          "Issue assigned successfully",
          issue
        })


  }catch(error){
     console.error("Assign issue error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to assign issue"
        });
  }
}


export { createIssue ,getAllIssues,getIssueById,updateIssues,deleteIssue,assignIssue};