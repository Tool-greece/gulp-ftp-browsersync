var gulp = require("gulp");
var gutil = require("gulp-util");
var ftp = require("vinyl-ftp");
var browsersync = require("browser-sync").create();
env = require("gulp-env");
/** Configuration **/
env({ file: ".env.json" });

var remoteFolder = process.env.ftp_remotePath;
var user = process.env.ftp_user,
  password = process.env.ftp_password,
  host = process.env.ftp_host,
  port = process.env.ftp_port;

var localFilesGlob = [
  "./**/**/*",
  "!./node_modules/**/*",
  "!./env.json",
  "!./gulpfile.js"
];

function browserSync(done) {
  browsersync.init({
    // server: {
    //   baseDir: "./dist"
    // },
    proxy: "www.tool-lx.gr/acftest/",
    host: "www.tool-lx.gr/acftest/",
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// helper function to build an FTP connection based on our configuration
function getFtpConnection() {
  return ftp.create({
    host: host,
    port: port,
    user: user,
    password: password,
    parallel: 2,
    log: gutil.log
  });
}

function deploy() {
  var conn = getFtpConnection();
  changesDetected();
  return gulp
    .src(localFilesGlob, { base: ".", buffer: false })
    .pipe(conn.newer(remoteFolder)) // only upload newer files
    .pipe(conn.dest(remoteFolder));
}

function changesDetected() {
  console.log("Changes detected! Uploading file");
}

function deployWatch() {
  gulp.watch(localFilesGlob, gulp.series(deploy, browserSyncReload));
}

var deploylive = gulp.parallel(deployWatch, browserSync);

exports.deploylive = deploylive;
