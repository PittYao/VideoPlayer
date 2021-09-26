<template>
  <video-player
    v-for="(item, index) in rtspList"
    :key="index"
    :rtspUrl="item.rtspUrl"
    :disableAudio="item.disableAudio"
    :play="item.play"
    :muted="item.muted"
    v-model:full="item.full"
    :class="{ selected: item.selected }"
    @click="selectedVideoElem(index)"
  />
  <div>
    <button @click="getRtspList">获取播放地址集合</button> |
    <button @click="switchVideo(true)">开始播放</button> |
    <button @click="switchVideo(false)">关闭播放</button> |
    <button @click="switchMuted(true)">静音</button> |
    <button @click="switchMuted(false)">取消静音</button> |
    <button @click="launchFull">全屏</button> |
  </div>
</template>

<script>
import { ref } from "vue";
import VideoPlayer from "@/components/VideoPlayer.vue";

const useVideoPlayerEffect = (rtspList, selectedList) => {
  // 切换 开始/关闭 播放
  const switchVideo = (play) => {
    const data = selectedList.value;
    data.forEach((index) => {
      rtspList.value[index].play = play;
    });

    clearSelected();
  };

  // 切换 静音 控制
  const switchMuted = (muted) => {
    const data = selectedList.value;
    data.forEach((index) => {
      rtspList.value[index].muted = muted;
    });

    clearSelected();
  };

  // 全屏
  const launchFull = () => {
    const data = selectedList.value;

    if (data.length > 1 || data.length === 0) {
      alert("只能选择一个画面全屏");
      return;
    }

    const index = data[0];
    rtspList.value[index].full = true;

    clearSelected();
  };

  // 清除选中
  const clearSelected = () => {
    clearSelectedStyle();
    selectedList.value = [];
  };

  // 清除选中样式
  const clearSelectedStyle = () => {
    rtspList.value.forEach((item) => {
      item.selected = false;
    });
  };
  return { switchVideo, switchMuted, launchFull };
};

export default {
  name: "Home",
  components: {
    VideoPlayer,
  },
  setup() {

    let rtspList = ref([]);
    let selectedList = ref([]);

    const { switchVideo, switchMuted, launchFull } = useVideoPlayerEffect(
      rtspList,
      selectedList
    );

    // 模拟从后台获取rtsp数据
    /* 
      参数说明：
        rtspUrl: 地址
        disableAudio: 硬件设备是否支持音频，编码器不支持=false,摄像头支持=true
        play: 是否自动播放 [默认播放=true]
        selected: 选中状态 [添加边框]
        muted: 是否静音 [默认不静音=false]
    */
    const getRtspList = () => {
      rtspList.value = [
        {
          // rtspUrl: "rtsp://admin:hk123456@10.0.5.2:554",
          rtspUrl: "rtsp://admin:cebon61332433@192.168.99.215",
          disableAudio: false,
          play: false,
          selected: false,
          muted: false,
          full: false,
        },
        {
          // rtspUrl: "rtsp://admin:hk123456@10.0.6.2:554",
          rtspUrl: "rtsp://admin:61332433@192.168.99.117",
          disableAudio: true,
          play: true,
          selected: false,
          muted: false,
          full: false,
        },
      ];
    };

    // 添加节点到选中集合
    const selectedVideoElem = (index) => {
      let videoElem = rtspList.value[index];
      let selectedListRef = selectedList.value;
      if (videoElem !== undefined) {
        selectedListRef.includes(index) === true
          ? selectedListRef.shift(index)
          : selectedListRef.push(index);
        videoElem.selected = !videoElem.selected;
      }
    };

    return {
      rtspList,
      selectedList,
      switchVideo,
      switchMuted,
      launchFull,
      getRtspList,
      selectedVideoElem,
    };
  },
};
</script>

<style lang="scss" scoped>
.selected {
  border: 1px solid red;
}
</style>