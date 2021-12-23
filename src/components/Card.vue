<template>
  <div class="card-wrap"
    :style="{transform: `scale(${scale})`}">
    <div :class="`card ${back?'back':''}`" 
    :style="{backgroundPosition: position}"></div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    code: String,
    back: {
      type: Boolean,
      default: false
    },
    scale: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      count: '',
      color: 'club',
      position: '',
      colors: ['club', 'diamond', 'hearts', 'spade', 'joker'], // 梅花、方块、红桃、黑桃
    }
  },
  mounted(){
    if(this.code){
      this.init(this.code);
    }
  },
  watch: {
    code(value) {
      console.log('watch code', value)
      this.init(value);
    }
  },
  methods: {
    init(code) {
      if (code) {
        const [color, count] = code.split('-');
        this.color = color;
        this.count = count;
        const colorIndex = this.colors.findIndex(item => item === color);
        const cardIndex = colorIndex * 13 + parseInt(count) - 1;
        const y = Math.floor(cardIndex / 9);
        const x = cardIndex % 9;
        this.position = this.back ? '100% 100%' : `-${x * 410}px -${y * 575}px`;
      }
    }
  }
}
</script>

<style lang="less">
.card-wrap{
  width: 164px;
  height: 230px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.5);
  // box-shadow: 1px 1px 10px rgba(0,0,0,0.2);
  overflow: hidden;
  transform-origin: top left;
  background-color: #fff;
  .card{
    width: 410px;
    height: 575px;
    background-image: url(../assets/cards.png);
    background-repeat: no-repeat;
    transform: scale(0.4);
    transform-origin: top left;
    &.back{
      background: url(../assets/cardback.png) no-repeat center;
      background-size: 100% 100%;
    }
  }
}
</style>
