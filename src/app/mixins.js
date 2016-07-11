export function deepClone(item) {
  if (!item) { return item; }

  var types = [Number, String, Boolean];
  var result;

  types.forEach(function(type) {
    if (item instanceof type) {
      result = type( item );
    }
  });

  if (typeof result == "undefined") {
    if (Object.prototype.toString.call( item ) === "[object Array]") {
      result = [];
      item.forEach(function(child, index, array) { 
        result[index] = deepClone( child );
      });
    } else if (typeof item == "object") {
      if (item.nodeType && typeof item.cloneNode == "function") {
        var result = item.cloneNode( true );    
      } else if (!item.prototype) {
        if (item instanceof Date) {
          result = new Date(item);
        } else {
          result = {};

          for (var i in item) {
            result[i] = deepClone( item[i] );
          }
        }
      } else {
        if (false && item.constructor) {
          result = new item.constructor();
        } else {
          result = item;
        }
      }
    } else {
      result = item;
    }
  }

  return result;
}
