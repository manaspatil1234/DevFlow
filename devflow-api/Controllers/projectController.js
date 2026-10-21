import { Project,Team,ProjectMember,User,TeamMember } from "../models/associations.js";
import { sequelize } from "../config/database.js";

const createProject=async(req,res)=>{
    try{
            const {name,description,status,teamId}=req.body;

            if(typeof name!=="string" ||name.trim().length<3){
                return res.status(400).json({
                    status:false,
                    message:"Projects name must contain at least 3 characters"
                })
            }

            if(!Number.isInteger(Number(teamId))||Number(teamId)<=0){
                return res.status(400).json({
                    status:false,
                    message:"A validteamId is required"
                })
            }

            const team = await Team.findByPk(teamId)

            if(!team){
                return res.status(404).json({
                    status:false,
                    message:"Team doesnt exist"
                })
            }

            const project = await sequelize.transaction(async(transaction)=>{
                const newProject = await Project.create({
                    name:name.trim(),
                    description,
                    status,
                    teamId:team.id
                },{transaction})

                await ProjectMember.create({
                    userId:req.user.id,
                    projectId:newProject.id,
                    role:"admin"
                },{transaction})

                return newProject
            })

            return res.status(201).json({
                status:true,
                message:"Project created successfully",
                project
            })

    }catch(error){
        console.error("Create project error",error);

        if(error.name === "SequelizeValidationError"){
            return res.status(400).json({
                status:false,
                message:error.errors.map((e)=>e.message)
            })
        }
        return res.status(500).json({
            status:false,
            message:"Internal sever error"
        })

    }
}

const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [
                {
                    model: ProjectMember,
                    where: {
                        userId: req.user.id
                    },
                    attributes: [],
                    required: true
                }
            ]
        });

        return res.status(200).json({
            status: true,
            count: projects.length,
            projects
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Failed to fetch projects",
            error: error.message
        });
    }
};

const getProjectById = async(req,res)=>{
    try{
        
        const project = await Project.findByPk(req.params.id,{
            include:[{
                model:Team,
                attributes:["id",'name']
            }]
        })
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


        return res.status(200).json({
            status:true,
            project
        })

    }catch(error){
        console.error("Fetch project error",error);
        return res.status(500).json({
            status:false,
            message:"Internal server error"
        })
    }
}

const updateProject = async(req,res)=>{
    try{
        const {name,description,status}=req.body
        const project = await Project.findByPk(req.params.id)

        if(!project){
            return res.status(404).json({
                status: false,
                message: "Project doesn't exist"
            })
            
        }

        const membership = await ProjectMember.findOne({
            where:{
                projectId:project.id,
                userId:req.user.id
            }
        })

        if(!membership){
                return res.status(403).json({
                status: false,
                message: "You are not a member of this project"
                });
        }
        if (membership.role !== "admin") {
                return res.status(403).json({
                status: false,
                message: "Only project admins can update this project"
    });
}

        const updates = {}
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length < 3) {
                return res.status(400).json({
                    status: false,
                    message: "Project name must contain at least 3 characters"
        });
      }
      updates.name = name.trim();
    }

    if(description!== undefined){
        if (typeof description !== "string") {
        return res.status(400).json({
          status: false,
          message: "Description must be a string"
        });
      }
      updates.description = description;
    }

    if(status!==undefined){
        if(!["planned","active","completed"].includes(status)){
            return res.status(400).json({
                status:false,
                message:"Invalid project status"
            })
        }
        updates.status = status
    }

    if (Object.keys(updates).length===0){
        return res.status(400).json({
            status:false,
            message:"Provide at least one field to update"
        })
    }

    await project.update(updates)
    return res.status(200).json({
      status: true,
      message: "Project updated successfully",
      project
    });
    }catch(error){
        console.error("Update project error:", error);
        return res.status(500).json({
        status: false,
        message: "Internal server error"
    });
    }
}

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        status: false,
        message: "Project doesn't exist"
      });
    }

    const membership = await ProjectMember.findOne({
        where:{
            projectId:project.id,
            userId:req.user.id
        }
    })
             if (!membership) {
            return res.status(403).json({
                status: false,
                message: "You are not a member of this project"
            });
        }

        // Only admins can delete projects
        if (membership.role !== "admin") {
            return res.status(403).json({
                status: false,
                message: "Only project admins can delete this project"
            });
        }

    await project.destroy();

    return res.status(200).json({
      status: true,
      message: "Project deleted successfully"
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};


const addProjectMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId, role } = req.body;

        // 1. Validate the user ID
        if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
            return res.status(400).json({
                status: false,
                message: "A valid userId is required"
            });
        }

        // 2. Validate the role
        if (!["admin", "member"].includes(role)) {
            return res.status(400).json({
                status: false,
                message: "Role must be admin or member"
            });
        }

        // 3. Find the project
        console.log("Requested projectId:", projectId);
        console.log("Project table:", Project.getTableName());
        console.log("Database:", Project.sequelize.config.database);
        const project = await Project.findByPk(projectId);
        console.log("Found project:", project ? project.id : null);
        if (!project) {
            return res.status(404).json({
                status: false,
                message: "Project not found"
            });
        }

        console.log("Logged-in user:", req.user);
        console.log("Project ID:", project.id);

        // 4. Check the logged-in user's role in this project
        const callerMembership = await ProjectMember.findOne({
            where: {
                projectId: project.id,
                userId: req.user.id
            }
        });

        if (!callerMembership || callerMembership.role !== "admin") {
            return res.status(403).json({
                status: false,
                message: "Only project admins can add members"
            });
        }

        // 5. Confirm the target user exists
        const user = await User.findByPk(Number(userId));

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        

        
const teamMembership = await TeamMember.findOne({
  where: {
    teamId: project.teamId,
    userId: user.id,
  },
});

if (!teamMembership) {
  return res.status(403).json({
    status: false,
    message: "This user must belong to the project's team before being added to the project.",
  });
}


        // 6. Prevent duplicate memberships
        const existingMembership = await ProjectMember.findOne({
            where: {
                projectId: project.id,
                userId: user.id
            }
        });

        if (existingMembership) {
            return res.status(409).json({
                status: false,
                message: "User is already a project member"
            });
        }

        // 7. Create the membership
        const membership = await ProjectMember.create({
            projectId: project.id,
            userId: user.id,
            role
        });

        return res.status(201).json({
            status: true,
            message: "Project member added successfully",
            membership
        });

    } catch (error) {
        console.error("Add project member error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal server error"
        });
    }
};

const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        status: false,
        message: "Project not found"
      });
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

    const members = await ProjectMember.findAll({
      where: {
        projectId: project.id
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"]
        }
      ]
    });

    return res.status(200).json({
      status: true,
      count: members.length,
      members
    });
  } catch (error) {
    console.error("Get project members error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
  


};

const removeProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      return res.status(400).json({
        status: false,
        message: "A valid userId is required"
      });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        status: false,
        message: "Project not found"
      });
    }

    const callerMembership = await ProjectMember.findOne({
      where: {
        projectId: project.id,
        userId: req.user.id
      }
    });

    if (!callerMembership || callerMembership.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Only project admins can remove members"
      });
    }

    const targetMembership = await ProjectMember.findOne({
      where: {
        projectId: project.id,
        userId: Number(userId)
      }
    });

    if (!targetMembership) {
      return res.status(404).json({
        status: false,
        message: "User is not a member of this project"
      });
    }

    if (Number(userId) === Number(req.user.id)) {
      return res.status(400).json({
        status: false,
        message: "You cannot remove yourself from this project"
      });
    }

    
if (targetMembership.role === "admin") {
  const adminCount = await ProjectMember.count({
    where: {
      projectId: project.id,
      role: "admin"
    }
  });

  if (adminCount <= 1) {
    return res.status(400).json({
      status: false,
      message: "Cannot remove the last admin from this project"
    });
  }
}


    await targetMembership.destroy();

    return res.status(200).json({
      status: true,
      message: "Project member removed successfully"
    });
  } catch (error) {
    console.error("Remove project member error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};


const updateProjectMemberRole = async (req, res) => {
  try {
    const { projectId, userId } = req.params;
    const { role } = req.body;

    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({
        status: false,
        message: "Role must be admin or member"
      });
    }

    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        status: false,
        message: "Project not found"
      });
    }

    const callerMembership = await ProjectMember.findOne({
      where: {
        projectId: project.id,
        userId: req.user.id
      }
    });

    if (!callerMembership || callerMembership.role !== "admin") {
      return res.status(403).json({
        status: false,
        message: "Only project admins can update member roles"
      });
    }

    const targetMembership = await ProjectMember.findOne({
      where: {
        projectId: project.id,
        userId: Number(userId)
      }
    });

    if (!targetMembership) {
      return res.status(404).json({
        status: false,
        message: "User is not a member of this project"
      });
    }

    if (
      targetMembership.role === "admin" &&
      role === "member"
    ) {
      const adminCount = await ProjectMember.count({
        where: {
          projectId: project.id,
          role: "admin"
        }
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          status: false,
          message: "Cannot demote the last admin of this project"
        });
      }
    }

    await targetMembership.update({ role });

    return res.status(200).json({
      status: true,
      message: "Member role updated successfully",
      membership: targetMembership
    });
  } catch (error) {
    console.error("Update project member role error:", error);

    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};


export { addProjectMember,getProjectMembers,removeProjectMember ,updateProjectMemberRole};


export {createProject,getAllProjects,getProjectById,updateProject,deleteProject}