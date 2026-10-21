import { Team } from "./Team.js";
import { Project } from "./Project.js";
import { Issue } from "./Issue.js";
import { User } from "./User.js";
import { ProjectMember } from "./ProjectMember.js";
import { Comment } from "./Comment.js";
import { Activity } from "./Activity.js";
import { TeamMember } from "./TeamMember.js";

Team.hasMany(Project,{
    foreignKey:"teamId",
    onDelete:"CASCADE"
})

Project.belongsTo(Team,{
    foreignKey:"teamId",
})

Project.hasMany(Issue,{
    foreignKey:"projectId",
    onDelete:"CASCADE"
})

Issue.belongsTo(Project,{
    foreignKey:"projectId"
})

User.hasMany(Issue,{
    foreignKey:"createdById",
    as:"createdIssues"
})

Issue.belongsTo(User,{
    foreignKey:"createdById",
    as:"creator",
    onDelete:"SET NULL"
})

User.hasMany(Issue,{
    foreignKey:"assigneeId",
    as:"assignedIssues"
})

Issue.belongsTo(User,{
    foreignKey:"assigneeId",
    as:"assignee",
    onDelete:"SET NULL"
})

User.hasMany(ProjectMember,{
    foreignKey:"userId",
    onDelete:"CASCADE"
})

ProjectMember.belongsTo(User,{
    foreignKey:"userId"
})

Project.hasMany(ProjectMember,{
    foreignKey:"projectId",
    onDelete:"CASCADE"
})

ProjectMember.belongsTo(Project,{
    foreignKey:"projectId"
})

User.hasMany(Comment,{
    foreignKey:"userId",
    onDelete:"CASCADE"
});

Comment.belongsTo(User,{
    foreignKey:"userId"
})

Issue.hasMany(Comment,{
    foreignKey:"issueId",
    onDelete:"CASCADE"
})

Comment.belongsTo(Issue,{
    foreignKey:"issueId"
})

User.hasMany(Activity,{
    foreignKey:"userId",
    onDelete:"CASCADE"
})

Activity.belongsTo(User,{
    foreignKey:"userId"
})

Issue.hasMany(Activity,{
    foreignKey:"issueId",
    onDelete:"CASCADE"
})

Activity.belongsTo(Issue,{
    foreignKey:"issueId"
})

// Team membership
Team.hasMany(TeamMember, {
  foreignKey: "teamId",
  onDelete: "CASCADE",
});

TeamMember.belongsTo(Team, {
  foreignKey: "teamId",
});

User.hasMany(TeamMember, {
  foreignKey: "userId",
  onDelete: "CASCADE",
});

TeamMember.belongsTo(User, {
  foreignKey: "userId",
});

export {Team,Project,Issue,User,ProjectMember,Comment,Activity,TeamMember}