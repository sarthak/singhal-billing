function normalizedFloat(number) {
  return +((+number).toFixed(2));
}

function normalizedInt(number) {
  return (+number).toFixed(0);
}

function toIndianDate(date) {
  return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
}

function checkPrice(price) {
  let p = +price;
  if (isNaN(p)) {
    window.alert('Price is not a valid number');
    return false;
  } else if (p < 0) {
    window.alert('Price should be positive');
  }
  return true;
}

function checkDiscount(discount) {
  let d = +discount;
  if (isNaN(d)) {
    window.alert('Discount is not a valid number');
    return false;
  } else if (d < 0 || d > 100) {
    window.alert('Discount should be a percentage between 0 and 100');
    return false;
  }
  return true;
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
          get: function () {
            let retval = this.html[key][value.property];
            if (value.hasOwnProperty('get')) {
              return value.get(retval);
            }
            return retval;
          },
          set: function (val) {
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

function Paginator(config) {
  this.navs = config.navs.map((nav) => {
    return newLiveElement({
      nodes: {
        page: {
          node: nav.querySelector('label[name=cur-page]'),
          property: 'textContent'
        },
        maxpage: {
          node: nav.querySelector('label[name=max-page]'),
          property: 'textContent'
        },
        first: {
          node: nav.querySelector('button[name=first]')
        },
        last: {
          node: nav.querySelector('button[name=last]')
        },
        prev: {
          node: nav.querySelector('button[name=prev]')
        },
        next: {
          node: nav.querySelector('button[name=next]')
        }
      }
    });
  });
  this.body = config.body;
  this.maxitems = config.maxitems ? config.maxitems : 20;
  this.items = config.items;
  this.page = config.page ? config.page : 0;
  this.renderer = config.renderer ? config.renderer : ((a) => a);

  const paginator = this;
  this.navs.forEach((nav) => {
    nav.page = this.page;
    nav.maxpage = Math.ceil(this.items.length / this.maxitems) - 1;
    nav.html.first.addEventListener('click', () => paginator.displayPage(0));
    nav.html.prev.addEventListener('click', () => paginator.displayPage(paginator.page - 1));
    nav.html.next.addEventListener('click', () => paginator.displayPage(paginator.page + 1));
    nav.html.last.addEventListener('click', () => paginator.displayPage(nav.maxpage));
  });

  this.displayPage(this.page);
}

Paginator.prototype = {
  displayPage: function (page) {
    if (page * this.maxitems >= this.items.length) {
      page = Math.ceil(this.items.length / this.maxitems) - 1;
    }
    if (page < 0) {
      page = 0;
    }
    let newitems = Array();
    for (let i = page * this.maxitems;
      i < Math.min(this.items.length, (page + 1) * this.maxitems);
      i++) {
      newitems.push(this.renderer(this.items[i]));
    }
    this.body.replaceChildren(...newitems);
    this.page = page;

    this.navs.forEach((nav) => {
      nav.page = this.page;
    });
  },

  refresh: function () {
    this.navs.forEach((nav) => {
      nav.maxpage = Math.ceil(this.items.length / this.maxitems) - 1;
    });
    this.displayPage(this.page);
  }
}
