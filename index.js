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

  out.project_num = parseInt(matched[1]);
  out.review_num  = parseInt(matched[2]);
  out.patch_num   = parseInt(matched[3]);

  core.info('');
  core.startGroup('Outputting results...');
  core.info(JSON.stringify(out));
  core.endGroup();

  const artifact_id = 'check-project-release';
  const filename = `${artifact_id}.json`;

  fs.writeFileSync(filename, JSON.stringify(out));
  core.setOutput('results_name', artifact_id);
  core.setOutput('results_json', filename);

  return out;
}