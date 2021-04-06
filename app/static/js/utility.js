function normalizedFloat(number) {
  return +((+number).toFixed(2));
}

function normalizedInt(number) {
  return (+number).toFixed(0);
}

function toIndianDate(date) {
  return `${date.getDate()} / ${date.getMonth()+1} / ${date.getFullYear()}`;
}


function rec_generateProperties(obj, tree) {
  for (const [key, value] of Object.entries(tree)) {
    // Iterate through all properties of this subtree
    if (value.hasOwnProperty('node')) {
      // This property represents a DOM node
      // First insert entry into html
      if (!obj.hasOwnProperty('html'))
        obj.html = {};
      obj.html[key] = value.node;
      if (value.hasOwnProperty('property')) {
        // Now create getter and setters that bind dynamically
        Object.defineProperty(obj, key, {
          get: function() {
            let retval = this.html[key][value.property];
            if (value.hasOwnProperty('get')) {
              return value.get(retval);
            }
            return retval;
          },
          set: function(val) {
            let node = this.html[key];
            if (value.hasOwnProperty('set')) {
              node[value.property] = value.set(val);
              return;
            }
            node[value.property] = val;
          }
        });
      }
    } else {
      obj[key] = {}
      rec_generateProperties(obj[key], value);
    }
  }
}

function newLiveElement(elems) {
  let obj = Object.create(elems);
  rec_generateProperties(obj, elems.nodes);
  delete elems.nodes;
  return obj;
}
