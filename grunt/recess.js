module.exports = {
	less: {
      files: {
        'src/css/app.css': [
          'src/css/less/app.less'
        ],
        'src/css/md.css': [
          'src/css/less/md.less'
        ],
        'src/css/auralic.css': [
          'src/css/less/auralic.less'
        ],
        //'src/css/app.rtl.css': [
        //  'src/css/less/app.rtl.less'
      //  ]
      },
      options: {
        compile: true
      }
  }
}
