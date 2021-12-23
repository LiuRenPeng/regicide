<template>
  <div class="mask">
    <div class="modal">
      <div class="msg">{{msg}}</div>
      <div class="btn" @click="clickBtn">再玩一次</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Card',
  props: {
    msg: String,
    clickBtn: Function
  },
  data() {
    return {}
  }
}
</script>

<style lang="less">

.mask{
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,0.6);
  .modal{
    width: 600px;
    height: 260px;
    background-color: rgba(240,235,217,1);
    border-radius: 10px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    .msg{
      font-size: 36px;
      color: #362012;
      line-height: 140px;
      text-align: center;
    }
    .btn{
      margin-top: 10px;
      border: 2px solid #362012;
      border-radius: 4px;
      text-align: center;
      width: 120px;
      height: 50px;
      font-size: 24px;
      line-height: 50px;
      color: #362012;
      cursor: pointer;
      &:hover{
        background-color: #52301c;
        color: rgba(240,235,217,1);
      }
    }
  }
}
</style>
