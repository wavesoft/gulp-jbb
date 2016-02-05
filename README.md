# gulp-jbb

> Compile javascript bundles to binary bundles using the [jbb compiler](https://github.com/wavesoft/jbb)

## Installation

Install package with NPM and add it to your development dependencies:

    npm install --save-dev gulp-jbb

## Usage

```javascript
var jbb   = require('gulp-jbb');

gulp.task('bundles', function() {
    return gulp
        .src([ 'mybundle.jbbsrc' ])
        .pipe(jbb({
            'profile': 'three'
        }))
        .pipe(gulp.dest('build'));
});
```

## Options

- `profile`

    The JBB Profile to use, for example `three` for [jbb-profile-three](https://github.com/wavesoft/jbb-profile-three).

- `sparse` (optional)

    Set to `true` to create a sparse JBB bundle (creates 4 files, loaded in parallel by the browser).

- `path` (optional)

    The base directory relative to which jbb compiler will search for other bundles (ex. dependencies).

- `log` (optional)
    
    A bit mask with the compiler log messages to enable. This is used for debugging the binary protocol and should remain `0x00`

- `name` (optional)
    
    Override the name of the bundle. This value is automatically populated based on the filename.

