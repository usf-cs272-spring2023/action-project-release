module.exports = async ({github, context, core, fs}) => {
  // store results
  const out = {};

  // get inputs from environment
  out.project_repo = process.env.PROJECT_REPO;
  out.release_tag  = process.env.RELEASE_TAG;

  core.info('');
  core.info(`Repository: ${out.project_repo}`);
  core.info(`   Release: ${out.release_tag}`);

  // parse release tag into parts
  const regex = /^v([1-4])\.(\d+)\.(\d+)$/;
  const matched = out.release_tag.match(regex);

  if (matched === null || matched.length !== 4) {
    core.info('');
    throw new Error(`Unable to parse "${out.release_tag}" into major, minor, and patch version numbers.`);
  }

  // save parsed values
  out.project_num = parseInt(matched[1]);
  out.review_num  = parseInt(matched[2]);
  out.patch_num   = parseInt(matched[3]);

  // out.project_ok = false;
  // out.review_ok  = false;
  

  // let [someResult, anotherResult] = await Promise.all([
  //   someCall(), 
  //   octokit.rest.repos.listReleases({
  //     owner: context.repo.owner,
  //     repo: context.repo.repo,
  //   });
  // ]);

  // check project number (p)
  // must have 2 review issues for project (p - 1)

  // check review number (r)
  // must have (r - 1) approved pull requests

  // verify the patch number
  if (out.patch_num === 0) {
    out.patch_ok = true;
  }
  else {
    // see if have a release with (patch - 1) version number
    const previous_tag = `v${out.project_num}.${out.review_num}.${out.patch_num - 1}`;
    
    try {
      const result = github.rest.repos.getReleaseByTag({
        owner: context.repo.owner,
        repo: out.project_repo,
        tag: previous_tag
      });

      if (result.status === 200 && result.data.length === 1) {
        out.patch_ok = true;
      }
    }
    catch (error) {
      out.patch_ok = false;
      out.patch_error = `Unable to find previous ${previous_tag} release. Check the last version number (the patch) is incremented properly.`;
    }
  }

  // add artifact name and json file
  out.results_name = 'check-project-release';
  out.results_json = `${out.results_name}.json`;

  // write results to file
  fs.writeFileSync(out.results_json, JSON.stringify(out));
  core.setOutput('results_name', out.results_name);
  core.setOutput('results_json', out.results_json);

  // display final results before returning
  core.info('');
  core.startGroup('Outputting results...');
  core.info(JSON.stringify(out));
  core.endGroup();

  return out;
}