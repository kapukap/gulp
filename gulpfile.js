const projectFolder = 'dist';
const courseFolder = 'src';

const {src, dest} = require('gulp');
const gulp = require('gulp');
const browser = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const imageMin = require('gulp-imagemin');


let path = {
    build: {
        html: projectFolder + '/',
        css: projectFolder + '/styles/',
        js: projectFolder + '/scripts/',
        img: projectFolder + '/img/',
        fonts: projectFolder + '/fonts/'
    },
    src: {
        html: [courseFolder + '/**/*.html', '!' + courseFolder + '/html/***/**/_*.html'],
        css: courseFolder + '/scss/main.scss',
        js: courseFolder + '/scripts/**/*.js',
        img: courseFolder + '/img/**/*.*',
        fonts: courseFolder + '/fonts/**/*.ttf'
    },
    watch: {
        html: courseFolder + '/**/*.html',
        css: courseFolder + '/scss/**/*.scss',
        js: courseFolder + '/scripts/**/*.js',
        img: courseFolder + '/img/**/*.*',
    },
    clear: './' + projectFolder + '/'
};


const browserSync = () => {
    browser.init({
        server: {
            baseDir: path.clear,
            port: 3000,
            notify: false
        }
    })
};


const htmlRender = () => {
    return src(path.src.html)
        .pipe(fileInclude())
        .pipe(dest(path.build.html))
        .pipe(browser.stream());
};

const styleRender = () => {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: 'expanded'
        }))
        .pipe(groupMedia())
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(dest(path.build.css))
        .pipe(cleanCss())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest(path.build.css))
        .pipe(browser.stream());
};

const jsRender = () => {
    return src(path.src.js)
        .pipe(fileInclude())
        .pipe(dest(path.build.js))
        .pipe(browser.stream());
};

const imgRender = () => {
    return src(path.src.img)
        .pipe(imageMin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3
        }))
        .pipe(dest(path.build.img))
        .pipe(browser.stream());
};

//Refactor Files (delete extra libraries)
const clearFiles = () => {
    return del(path.clear);
};
// End Refactor Files

const gulpWatch = () => {
    gulp.watch([path.watch.html], htmlRender);
    gulp.watch([path.watch.css], styleRender);
    gulp.watch([path.watch.js], jsRender);
    gulp.watch([path.watch.img], imgRender);
}


let build = gulp.series(clearFiles, gulp.parallel(jsRender, styleRender, htmlRender, imgRender));
let watch = gulp.parallel(build, gulpWatch, browserSync);

exports.build = build;
exports.jsRender = jsRender;
exports.htmlRender = htmlRender;
exports.styleRender = styleRender;
exports.imgRender = imgRender;
exports.watch = watch;
exports.default = watch;
