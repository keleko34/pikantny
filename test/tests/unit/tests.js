/* TODO */

/* attributes */

/* styles */

/* inputs */

/* functions */

var tests = (function(){
  return function(describe,it,expect,spy)
  {
    var methods = [
          
        ];
    
    function runCategory(key,value,parent,child)
    {
      describe(key+':', function(){
        for(var x=0,len=methods.length;x<len;x++)
        {
          methods[x](key,value,parent,child);
        }
      });
    }
    
    describe("",function(){
      
    });
  }
}());