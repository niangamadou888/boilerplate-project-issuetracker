
const projectName = 'apitest';

module.exports = {

    projectName: projectName,
    
    url: '/api/issues/' + projectName,

    issueWithEveryField: {
        issue_title: "Testing post",
        issue_text: "Testing post api",
        created_by: "psaya",
        assigned_to: "psaya",
        status_text: "open"
    },

    issueWithRequiredFields: {
        issue_title: "Testing post",
        issue_text: "Testing post api",
        created_by: "psaya"
    },

    issueWithMissingRequiredField: {
        issue_text: "Testing post api",
        created_by: "psaya"
    },

    issue1: {
        project: projectName,
        issue_title: "Testing 1",
        issue_text: "Testing api 1",
        created_by: "psaya",
        assigned_to: "psaya",
        status_text: "Open issue",
        created_on: new Date(),
        updated_on: new Date(),
        open: true
    },

    issue2: {
        project: projectName,
        issue_title: "Testing 2",
        issue_text: "Testing api 2",
        created_by: "prsaya",
        assigned_to: "prsaya",
        status_text: "In progress",
        created_on: new Date(),
        updated_on: new Date(),
        open: true
    }
}