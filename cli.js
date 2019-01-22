#! /usr/bin/env node

const prompts = require("prompts");
const path = require("path");
const fs = require("fs");
const opn = require("opn");
const args = process.argv;
const {
  generateAuthHeader,
  getAxiosInstance,
  getJIRADateFormat,
  requiredValidator,
  getWorkLogPromptFields,
  getStatusPrompt,
  spinner,
  PROJECTS_PATH
} = require("./utils");
const projects = JSON.parse(fs.readFileSync(PROJECTS_PATH));

const main = async () => {
  try {
    const axiosInstance = await getAxiosInstance();
    const { ISSUE_KEY, TIME_SPENT, COMMENT } = await getWorkLogPromptFields();
    let baseurl = projects[ISSUE_KEY.split("-")[0]]["url"];
    const url = `${baseurl}/rest/api/2/`;
    axiosInstance.defaults.baseURL = url;

    spinner.start();

    const response = await axiosInstance.post(`/issue/${ISSUE_KEY}/worklog`, {
      started: getJIRADateFormat(),
      timeSpent: TIME_SPENT,
      comment: COMMENT || `Working on issue ${ISSUE_KEY}`
    });

    spinner.stop();

    console.log("Worklog has been added");
    const { STATUS } = await getStatusPrompt();
    if (STATUS) {
      opn(`${baseurl}/browse/${ISSUE_KEY}`);
    }
  } catch (error) {
    spinner.stop();
    if (error.response) {
      console.log("Failed Status code ", error.response.status);
    } else {
      console.log("Cyaa...");
    }
  }
};
const userFlag = args[2];
if (userFlag && userFlag.includes("cred")) {
  require("./credentials.js");
} else if (userFlag && userFlag.includes("env")) {
  opn("./.env");
} else {
  main();
}
