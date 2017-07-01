module.exports = {
  html: ['angular/index.html'],
  options: {
    dest: 'angular',
      blockReplacements : {
         js : function (block) {
            return '  <script src="' + block.dest + '?_v=' +  (new Date()).getTime() + '"></script>';
         },
          css : function (block) {
              return '<link rel="stylesheet" href="' + block.dest + '?_v=' +  (new Date()).getTime() + '">';
          },
      }
  }
}
