var gulp = require('gulp');
var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var plumber = require('gulp-plumber');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var spritesmith = require('gulp.spritesmith');
var cache = require('gulp-cache');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// 样式文件处理（包括：编译 less，合并 css，重命名，压缩，添加浏览器前缀，制作 sourcemaps，迁移到发布环境）
// ===============================================================================================

// 编译 less 文件
gulp.task('less', function(cb) {        // 传入一个回调函数，因此引擎可以知道何时它会被完成
    return gulp.src('src/css/less/**/*.less')
        .pipe(plumber())
        // .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(gulp.dest('src/css/less/tmp'))
        .pipe(concat('zz-all-less.css'))
        // .pipe(gulp.dest('src/css/less/tmp'))
        // .pipe(rename('all.min.css'))
        // .pipe(cleanCss())
        .pipe(autoprefixer({
            browsers: ['> 1%', 'not ie <= 8']
        }))
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('src/css'));

    console.log('less 文件处理完毕！');
    cb(err);        // 如果 err 不是 null 和 undefined，流程会被结束掉，'two' 不会被执行
});

gulp.task('css', ['less'], function(cb) {       // 标注一个依赖，依赖的任务必须在这个任务开始之前被完成
    return gulp.src('src/css/*.css')
        .pipe(concat('all.min.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('dist/css'));

    console.log('css 文件处理完毕！');
    cb(err);
});

// 执行所有样式相关任务，并且开启监视
gulp.task('css-watch', ['css'], function() {
    console.log('正在监视 less 及 css 文件变动');
    // 监听 sass
    var watcher = gulp.watch('src/css/less/*.less', ['css']);    // 监视那些文件的变动，以及变动之后执行的任务
    watcher.on('change', function(event) {
       console.log('事件路径： ' + event.path + ' 事件类型： ' + event.type + ', 正在执行的任务：style');
    });
});



// 压缩 JS
// =======
gulp.task('js-optimize', function(cb) {
    return gulp.src('src/js/*.js')
        // .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js/tmp'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));
    console.log('js 文件优化处理完毕！');
    cb(err);
});

gulp.task('js', ['js-optimize'], function(cb) {
    gulp.src('src/js/others/*.js')
        .pipe(gulp.dest('dist/js/others'));
    console.log('js 文件移动处理完毕！');

});

// 执行所有 js 相关任务，并且开启监视
gulp.task('js-watch', ['js'], function() {
    console.log('正在监视 js 文件变动');
    // 监听 js
    var watcher = gulp.watch('src/js/**/*.js', ['js']);    // 监视那些文件的变动，以及变动之后执行的任务
    watcher.on('change', function(event) {
       console.log('事件路径： ' + event.path + ' 事件类型： ' + event.type + ', 正在执行的任务：style');
    });
});

// 执行所有 js 及 样式 相关任务，并且开启监视
gulp.task('jc', function() {
    console.log('正在监视 js 及 样式 文件变动');
    var watcher = gulp.watch('src/@(js|css)/**/*.@(js|less)', ['js','css']);    // 监视那些文件的变动，以及变动之后执行的任务
    watcher.on('change', function(event) {
        console.log('事件路径： ' + event.path + ' 事件类型： ' + event.type + ', 正在执行的任务：js 及 样式');
    });
});

// 图片压缩
gulp.task('img', function() {
    return gulp.src(['src/img/**/*.{png,jpg,gif}'])
        .pipe(plumber())
        .pipe(cache(imagemin({      // 压缩修改的图片
            progressive: true,
            use: [pngquant()]    
        })))
        .pipe(gulp.dest('dist/img'));

    console.log('图片压缩完毕！');
});

//  合成 sprite 图  //非常实用的功能,可以把一些小图标放到src/img/tmp/文件夹中
gulp.task('sprite', function() {
    return gulp.src('src/img/tmp/!(sprite.png|*.css)')
        .pipe(spritesmith({
            imgName: 'icon.png',
            cssName: 'sprite.css'
        }))
        .pipe(gulp.dest('dist/img'));
    console.log('sprite 合成完毕');
});

gulp.task('serve',function() {
    browserSync({
        server: {
            // 端口号可以配置
            // host:'localhost:80',
            baseDir: ''
        },
        startPath: './index.html'
    });
// 如果路径改了,自行修改路径
    gulp.watch(['./*.html','./src/css/**/*.css','./src/js/**/*js','./src/img/**/*.*'], reload);
});

gulp.task('default',['serve','css-watch','jc'])

//'img'任务 自己单独开启   不是每次都需要重新压缩一遍
// 开发时候直接   gulp 即可开始开发