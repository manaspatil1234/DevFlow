import { Comment, Issue, ProjectMember, User,Activity } from "../models/associations.js";

//create a comment on an issue

const createComment = async(req,res)=>{
    try{
        const {issueId}=req.params
        const {content}= req.body

        // validate comment next

        if(typeof content!== "string" || !content.trim()){
            return res.status(400).json({
                status:false,
                message:"Comment content is required"
            })
        }

        //Find the issue
        const issue = await Issue.findByPk(issueId);

        if(!issue){
            return res.status(404).json({
                status:false,
                message:"Issue not found"
            })
        }

        //Check the logged-in users project membership
        const membership = await ProjectMember.findOne({
            where:{
                projectId : issue.projectId,
                userId:req.user.id
            }
        })

        if(!membership){
            return res.status(403).json({
                status:false,
                message:"You are not a member of this project"
            })
        }

        //save the comment using the authenticated users ID
        
const { comment, activity } = await sequelize.transaction(
  async (transaction) => {
    const comment = await Comment.create(
      {
        content: content.trim(),
        issueId: issue.id,
        userId: req.user.id,
      },
      { transaction }
    );

    const activity = await Activity.create(
      {
        action: "comment_added",
        description: `Comment added to issue "${issue.title}"`,
        issueId: issue.id,
        userId: req.user.id,
      },
      { transaction }
    );

    return { comment, activity };
  }
);

        return res.status(201).json({
            status:true,
            message:"Comment created successfully",
            comment
        })

    }catch(error){
        console.error("Create comment error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to create comment"
        })}
    }
    
    // Get all comments for an issue
const getComments = async (req, res) => {
    try {
        const { issueId } = req.params;

        const issue = await Issue.findByPk(issueId);

        if (!issue) {
            return res.status(404).json({
                status: false,
                message: "Issue not found"
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

        const comments = await Comment.findAll({
            where: { issueId: issue.id },
            include: [{
                model: User,
                attributes: ["id", "name"]
            }],
            order: [["createdAt", "ASC"]]
        });

        return res.status(200).json({
            status: true,
            count: comments.length,
            comments
        });

    } catch (error) {
        console.error("Get comments error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to retrieve comments"
        });
    }
};

export { createComment, getComments };