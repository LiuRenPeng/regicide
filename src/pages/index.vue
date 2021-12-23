<template>
  <div class="tablecloth">
    <div class="castle">
      <Card v-for="(card) in castleCardList" :key="card" :code="card" :scale="cardSize"
        class="card-deck" />
      <div class="castle-bar">
        <div class="hurt-num">{{bossAtk}}</div>
        <div class="hp-bar">
          <div class="hp-bar-content" :style="{width: `${Math.floor(bossHP/bossMaxHP*100)}%`}"></div>
        </div>
        <div class="hp-num">{{bossHP}}</div>
      </div>
    </div>
    <div class="rule1"></div>
    <div class="rule2"></div>
    <div class="tavern">
      <Card v-for="(card, index) in tavernCardList" :key="card" :code="card" :scale="miniCardSize" back
        class="card-deck" :style="{left: `${index}px`}" />
    </div>
    <div class="gurrycard">
      <div class="card-list" v-for="card in gurryCardList" :key="card" >
        <Card :code="card" :scale="microCardSize"/>
      </div>
    </div>
    <div :class="`btn-pass ${allowPass? '' : 'disable'}`">跳过</div>
    <div :class="`btn-play ${allowPlay? '' : 'disable'}`" @click="handlePlayCard">出牌</div>
    <div class="handcard">
      <Card v-for="(card) in handCardList" :key="card" :code="card" :scale="cardSize"
        :class="`card-play ${selectCardList.includes(card)? 'selected' : ''}`" @click="handleSelectCard(card)" />
    </div>
    <Modal v-if="showModal" :msg="modalMsg" @clickBtn="startGame" />
  </div>
</template>

<script>
import Card from '@/components/Card.vue';
import Modal from '@/components/Modal.vue';
export default {
  name: "App",
  components: {
    Card,
    Modal
  },
  props: {
    player: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      cardSize: document.documentElement.clientWidth / 1920,
      miniCardSize: document.documentElement.clientWidth / 1920 * 0.5,
      microCardSize: document.documentElement.clientWidth / 1920 * 0.25,
      colorList: ['club', 'diamond', 'hearts', 'spade'],
      castleCardList: [],
      handCardMax: 0,
      handCardList: [],
      selectCardList: [],
      gurryCardList: [],
      tavernCardList: [],
      allowPass: true,
      allowPlay: false,
      bossAtk: 10,
      bossMaxHP: 20,
      bossHP: 20,
      modalMsg: '',
      showModal: false
    };
  },
  created(){
    this.initCastleList();
    this.initTavernList();
    this.handCardMax = this.player === 4 ? 5 : (this.player === 3 ? 6 : (this.player === 2 ? 7 : 8))
    this.initHandList(this.handCardMax);
  },
  watch: {
    bossHP(val){
      if(val <= 0){
        if (val === 0){
          // 感化boss，加入到酒馆牌堆
          this.tavernCardList.push(this.castleCardList.pop());
        } else {
          // 消灭boss，移除到弃牌堆
          this.gurryCardList.push(this.castleCardList.pop());
        }
        if(this.castleCardList.length) {
          this.resetHP();
        } else {
          this.gameover(1);
        }
      }
    }
  },
  methods: {
    // 洗牌算法
    shuffle(arr){
      const res = [...arr];
      for (let i = 0; i < res.length; i++) {
        const random = Math.floor(Math.random() * (i + 1));
        [res[i], res[random]] = [res[random], res[i]];
      }
      return res;
    },
    // 拼接花色和点数
    getColorCount(counts) {
      const res = [];
      counts.forEach(count => {
        this.shuffle(this.colorList).forEach(color => {
          res.push(`${color}-${count}`)
        })
      })
      return res;
    },
    initCastleList() {
      const countList = [13,12,11];
      this.castleCardList = this.getColorCount(countList);
    },
    initTavernList() {
      const countList = [1,2,3,4,5,6,7,8,9,10];
      let cardList = this.getColorCount(countList);
      if (this.player === 4){
        cardList.concat(['joker-1', 'joker-2'])
      } else if (this.player === 3){
        cardList.concat(['joker-1'])
      }
      this.tavernCardList = this.shuffle(cardList);
    },
    // 抓牌
    drawCards(num){
      for(let i=0; i<num; i++) {
        this.handCardList.push(this.tavernCardList.pop());
      }
    },
    initHandList(cardNum) {
      this.drawCards(cardNum);
    },
    handleSelectCard(card){
      if(this.selectCardList.includes(card)){
        this.selectCardList = this.selectCardList.filter(item => item !== card);
      } else {
        this.selectCardList.push(card);
      }
      // 合法性校验
      this.allowPlay = this.ruleCheck(this.selectCardList);
    },
    // 合法性校验
    ruleCheck(cards){
      if(!cards.length) return false;
      if(cards.length > 1){
        const colors = cards.map(card => card.split('-')[0]);
        const counts = cards.map(card => card.split('-')[1]);
        if (colors.includes('joker')) return false;
        if (counts.find(count => count !== '1')) {
          if (counts.filter(count => count !== counts[0]).length === 0) return true;
          if (counts.filter(count => count !== '1').length === 1) return true;
          return false;
        }
        return true;
      }
      return true;
    },
    // 出牌
    handlePlayCard(){
      if(this.allowPlay) {
        // 出牌阶段
        this.handCardList = this.handCardList.filter(card => {
          return !this.selectCardList.includes(card)
        });
        this.gurryCardList.unshift(...this.selectCardList);
        this.allowPlay = false;
        // 结算
        this.computedHurt(this.selectCardList);
        this.selectCardList = [];
      }
    },
    // 结算
    computedHurt(cards){
      // 造成伤害
      const counts = cards.map(card => card.split('-')[1]);
      const hurt = counts.reduce((a,b) => parseInt(a) + parseInt(b), 0);
      this.bossHP = this.bossHP - hurt;
      // 发动技能
      const colors = Array.from(new Set(cards.map(card => card.split('-')[0])));
      this.colorList.forEach(skill => {
        if(this.skillCheck(colors, skill)) {
          this.startSkill(skill);
        }
      })
    },
    // 技能生效检查
    skillCheck(colors, skill){
      const hasJoker = colors.includes('joker');
      const bossColor = this.castleCardList[this.castleCardList.length-1].split('-')[0];
      if(colors.includes(skill)){
        if(bossColor !== skill) return true;
        if(hasJoker) return true;
        return false;
      }
      return false;
    },
    // 发动技能
    startSkill(skill){
      switch (skill) {
        case 'hearts':
          break;
        case 'diamond':
          break;
        case 'club':
          break;
        case 'spade':
          break;
        default:
          break;
      }
    },
    // 重置boss血条
    resetHP(){
      const bossCount = this.castleCardList[this.castleCardList.length-1].split('-')[1];
      if (bossCount == 11){
        this.bossAtk = 10;
        this.bossMaxHP = 20;
        this.bossHP = 20;
      } else if (bossCount == 12){
        this.bossAtk = 15;
        this.bossMaxHP = 30;
        this.bossHP = 30;
      } else {
        this.bossAtk = 20;
        this.bossMaxHP = 40;
        this.bossHP = 40;
      }
    },
    // 游戏结束
    gameover(win){
      if(win){
        this.modalMsg = '恭喜你，闯关成功！'
      } else {
        this.modalMsg = '闯关失败，少侠请重新来过。'
      }
      this.showModal = true;
    },
    startGame(){
      this.showModal = false;
    }
  }
};
</script>

<style lang="less">
  @import './index.less';
</style>
