// Force webcrypto-liner to use the registry version of elliptic instead of
// the git-hosted fork it ships with. Without this, pnpm's blockExoticSubdeps
// check rejects the install.
function readPackage(pkg) {
  if (pkg.name === "webcrypto-liner") {
    pkg.dependencies["elliptic"] = "^6.6.1";
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
