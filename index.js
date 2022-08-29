module.exports = async ({github, context, core, fs}) => {
  // store results
  const out = {
    error_count: 0,
    error_messages: []
  };

  // common operations when an error is found
  const handleError = function(message, fail) {
    out.error_count++;
    out.error_messages.push(message);

    if (fail) {
      core.setFailed(message);
    }
    else {
      core.error(message);
    }
    
    return out;
  };

  // get inputs from environment and add to outputs
  out.project_repo = process.env.PROJECT_REPO;
  out.release_tag  = process.env.RELEASE_TAG;

  core.info('');
  core.info(`Repository: ${out.project_repo}`);
  core.info(`   Release: ${out.release_tag}`);
  core.info('');

  try {
    // parse release tag into parts
    const regex = /^v([1-4])\.(\d+)\.(\d+)$/;
    const matched = out.release_tag.match(regex);

    if (matched === null || matched.length !== 4) {
      // cannot continue without a parsable version number
      const message = `Unable to parse "${out.release_tag}" into major, minor, and patch version numbers.`;
      return handleError(message, true);
    }

    // save parsed values
    out.version_project = parseInt(matched[1]);
    out.version_review  = parseInt(matched[2]);
    out.version_patch   = parseInt(matched[3]);
    out.version_number  = `v${out.version_project}.${out.version_review}.${out.version_patch}`;

    // default parameters for github API requests
    const params = {
      owner: context.repo.owner,
      repo: out.project_repo,
      per_page: 100
    }

    // fetch all releases, issues, and reviews
    const fetch_releases = github.rest.repos.listReleases(params);
    const fetch_issues   = github.rest.issues.listForRepo({...params, state: 'all'});
    const fetch_reviews  = github.rest.pulls.list({...params, state: 'all'});
    const fetch_all = [fetch_releases, fetch_issues, fetch_reviews];

    try {
      const [found_releases, found_issues, found_reviews] = await Promise.all(fetch_all);

      core.info(`Found ${found_releases.data.length} releases (status code: ${found_releases.status})...`);
      core.info(`Found ${found_issues.data.length} issues (status code: ${found_issues.status})...`);
      core.info(`Found ${found_reviews.data.length} reviews (status code: ${found_reviews.status})...`);
    }
    catch (error) {
      const message = `Unable to fetch releases, issues, and/or pull requests from ${out.project_repo}: ${error.message}.`;
      return handleError(message, true);
    } 
  }
  catch (error) {
    return handleError(error.message, true);
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
    core.info(`JSON: ${written}`);
    core.endGroup();

    // set and return results
    core.startGroup('Setting output...');
    for (const property in out) {
      // output and set result
      console.log(`${property}: ${out[property]}`);
      core.setOutput(property, out[property]);
    }
    core.endGroup();
  }

  return out;
}