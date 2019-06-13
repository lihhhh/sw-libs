
<script>
export default {
  props: {
    nodes: {
      type: [String, Array],
      default: () => ""
    }
  },
  data() {
    return {};
  },
  methods: {
    //
    rpxCgPx(attrs) {
      for (var k in attrs) {
        let vl = attrs[k];
        if(vl.indexOf('rpx')>0){
            vl = vl.replace('rpx','')
            attrs[k] = vl/2;
        }
      }
    },
    getVdom(h, nodes = []) {
      var that = this;
      var el;
      var deep = function(node) {
        let out;
        if (Array.isArray(node)) {
          out = [];
          node.map(it => {
            out.push(deep(it));
          });
        } else {
          var { name, attrs = {}, text } = node;
          if (node.type == "text") {
            name = "span";
          }
          if (node.children) {
            deep(node.children);
          }

        //   that.rpxCgPx(attrs);
          
          return h(
            name,
            {
              attrs
            },
            text
          );
        }
        return out;
      };

      el = deep(nodes);

      return h('span',el);
    }
  },
  render(h) {
    if (Array.isArray(this.nodes)) {
      return this.getVdom(h, this.nodes);
    } else {
      return h("div", {
        // DOM 属性
        domProps: {
          innerHTML: this.nodes
        }
      });
    }
  }
};
</script>

<style>
</style>
