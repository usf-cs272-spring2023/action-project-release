module.exports = async ({github, context, core, fs}) => {
  // store results
  const out = {
    error_count: 0,
    error_messages: []
  };

  // get inputs from environment and add to outputs
  out.project_repo = process.env.PROJECT_REPO;
  out.release_tag  = process.env.RELEASE_TAG;

  core.info('');
  core.info(`Repository: ${out.project_repo}`);
  core.info(`   Release: ${out.release_tag}`);

  try {
    // parse release tag into parts
    const regex = /^v([1-4])\.(\d+)\.(\d+)$/;
    const matched = out.release_tag.match(regex);

    if (matched === null || matched.length !== 4) {
      // cannot continue without a parsable version number
      core.error(`Unable to parse "${out.release_tag}" into major, minor, and patch version numbers.`);
    }

    // save parsed values
    out.version_project = parseInt(matched[1]);
    out.version_review  = parseInt(matched[2]);
    out.version_patch   = parseInt(matched[3]);
    out.version_number  = `v${out.version_project}.${out.version_review}.${out.version_patch}`;
  }
  catch (error) {
    out.error_count++;
    out.error_messages.push(error.message);
  }
  finally {
    // convert error messages to string
    out.error_messages = out.error_messages.join(' ');

    // add artifact name and json file
    out.results_name = 'check-project-release';
    out.results_json = `${out.results_name}.json`;

    // write results to file
    core.startGroup('Creating artifact...');
    fs.writeFileSync(out.results_json, JSON.stringify(out));

    const written = fs.readFileSync(out.results_json);
    core.info(written);
    core.endGroup();

    // set and return results
    core.startGroup('Setting output...');
    for (const property in out) {
      // make sure value in json output
      out[property] = JSON.stringify(out[property]);

      // output and set result
      console.log(`${property}: ${out[property]}`);
      core.setOutput(property, out[property]);
    }
    core.endGroup();
  }

  return out;

  // // verify the project number
  // if (out.project_num === 1) {
  //   out.project_okay = true;
  // }
  // else {
  //   // octokit.rest.pulls.list({
  //   //   owner,
  //   //   repo,
  //   // });

  //   try {
  //     const previous_issues = await github.rest.issues.listForRepo({
  //       owner: context.repo.owner,
  //       repo: out.project_repo,
  //       labels: `project${out.project_num - 1}`,
  //       per_page: 100
  //     });

  //     if (previous_issues.status === 200 && previous_issues.data.length > 0) {
  //       const pull_requests = previous_issues.data.filter(request => )
  //     }
  //     else {
  //       out.project_ok = false;
  //       out.project_error = `Unexpected result: ${JSON.stringify(previous_issues)}`;
  //     }
  //   }
  //   catch (error) {
  //     out.project_ok = false;
  //     out.project_error = `Unable to find any project ${out.project_num - 1} code reviews. You should have at least one project ${out.project_num - 1} code review before starting project ${out.project_num}.`;
  //   }

  //   // should not start working on next project until
  //   // have at least one review from previous project
    

  // }

  // // octokit.rest.pulls.list({
  // //   owner,
  // //   repo,
  // // });

  // // const current_issues = await github.rest.issues.listForRepo({
  // //   owner: context.repo.owner,
  // //   repo: out.project_repo,
  // //   labels: [`project${out.project_num}`],
  // //   per_page: 100
  // // });

  // // check project number (p)
  // // must have 2 review issues for project (p - 1)

  // // check review number (r)
  // // must have (r - 1) approved pull requests
  // if (out.review_num === 0) {
  //   // should be no pull requests
  // }
  // else {
  //   // if 1, there should be a test grade and no pull requests
  //   // if 2+, there should be r - 1 pull requests
  // }

  // // verify the patch number
  // if (out.patch_num === 0) {
  //   out.patch_ok = true;
  // }
  // else {
  //   // see if have a release with (patch - 1) version number
  //   const previous_tag = `v${out.project_num}.${out.review_num}.${out.patch_num - 1}`;
    
  //   try {
  //     const tag_result = await github.rest.repos.getReleaseByTag({
  //       owner: context.repo.owner,
  //       repo: out.project_repo,
  //       tag: previous_tag
  //     });

  //     if (tag_result.status === 200 && tag_result.data.length === 1) {
  //       out.patch_ok = true;
  //     }
  //     else {
  //       out.patch_ok = false;
  //       out.patch_error = `Unexpected result: ${JSON.stringify(tag_result)}`;
  //     }
  //   }
  //   catch (error) {
  //     out.patch_ok = false;
  //     out.patch_error = `Unable to find previous ${previous_tag} release. Check the last version number (the patch) is incremented properly.`;
  //   }
  // }

}