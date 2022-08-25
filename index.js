module.exports = async ({github, context, core, fs}) => {
  // store results
  const out = {};

  // get inputs from environment
  out.project_repo = process.env.PROJECT_REPO;
  out.release_tag  = process.env.RELEASE_TAG;

  core.info(`Repository: ${out.project_repo}`);
  core.info(`   Release: ${out.release_tag}`);
  core.info('');

  // parse release tag into parts
  const regex = /^v([1-4])\.(\d+)\.(\d+)$/;
  const matched = out.release_tag.match(regex);

  if (matched === null || matched.length !== 4) {
    throw new Error(`Unable to parse "${release_tag}" into major, minor, and patch version numbers.`);
  }

  out.project_num = parseInt(matched[1]);
  out.review_num  = parseInt(matched[2]);
  out.patch_num   = parseInt(matched[3]);

  core.startGroup('Outputting results...');
  core.info(JSON.stringify(out));
  core.endGroup();

  const filename = 'check-project-release.json';
  fs.writeFileSync(filename, JSON.stringify(out));

  return out;
}