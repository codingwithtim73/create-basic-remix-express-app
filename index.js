#!/usr/bin/env node

import inquirer from "inquirer";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import ora from "ora";
import chalk from "chalk";

const promptUser = async () => {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "What is the project name?",
      validate: (input) => (input ? true : "Project name is required"),
    },
    {
      type: "input",
      name: "description",
      message: "Enter your description:",
    },
    {
      type: "input",
      name: "author",
      message: "Enter the author name:",
    },
  ]);

  return answers;
};

const formatProjectName = (name) => {
  return name.replace(/\s+/g, "-").toLowerCase();
};

const cloneRepository = (projectName) => {
  return new Promise((resolve, reject) => {
    const spinner = ora(`Cloning repository into ${projectName}...`).start();
    const clone = spawn("git", [
      "clone",
      "https://github.com/codingwithtim73/remix_template.git",
      projectName,
    ]);

    clone.stdout.on("data", (data) => console.log(`stdout: ${data}`));

    clone.on("close", (code) => {
      spinner.stop();
      if (code !== 0) {
        reject(new Error(`git clone process exited with code ${code}`));
        return;
      }
      console.log(chalk.green(`Repository cloned into ${projectName}`));
      resolve();
    });
  });
};

const updatePackageJson = (projectPath, projectName, description, author) => {
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  packageJson.name = projectName;
  packageJson.description = description || "";
  packageJson.author = author || "";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(chalk.green("Updated package.json with provided details."));
};

const installDependencies = (projectPath) => {
  return new Promise((resolve, reject) => {
    const spinner = ora(
      chalk.blue("Installing dependencies, this may take a while ⏳...")
    ).start();

    const install = spawn("npm", ["install"], { cwd: projectPath });

    install.stdout.on("data", (data) => process.stdout.write(data));

    install.on("close", (code) => {
      spinner.stop();
      if (code !== 0) {
        reject(new Error(`npm install process exited with code ${code}`));
        return;
      }
      console.log(chalk.green("Dependencies installed successfully."));
      resolve();
    });
  });
};

const main = async () => {
  try {
    const { projectName, description, author } = await promptUser();
    const formattedProjectName = formatProjectName(projectName);
    const projectPath = path.join(process.cwd(), formattedProjectName);

    await cloneRepository(formattedProjectName);
    updatePackageJson(projectPath, formattedProjectName, description, author);
    await installDependencies(projectPath);

    console.log(chalk.green("🎉 Success! 🎉"));
    console.log(`\nTo get started:\n`);
    console.log(
      `Navigate to your project directory by running ${chalk.cyan(
        `cd ${formattedProjectName}`
      )}, then start the development server with ${chalk.cyan("npm run dev")}.`
    );
    console.log("Happy coding! 😀 ");
    console.log(
      `Support Code with Tim by buying me a coffee ${chalk.cyan(
        `https://www.buymeacoffee.com/codewithtim`
      )}`
    );
  } catch (error) {
    console.error(error);
  }
};

main();
