<template>
  <video ref="videoElem" autoplay></video>
</template>

<script>
import { ref, onMounted, reactive, watch } from "vue";
import { post, get } from "@/utils/request";

const usePcObjEffect = (rstpUrl, disableAudio) => {
  const videoElem = ref();
  const pcObj = reactive({
    pc: null,
    sendChannel: null,
    stream: null,
    suuid: 0,
    // 接口地址
    registerUrl: "/stream/register",
    receiverUrl: "/stream/receiver/",
    codecUrl: "/stream/codec/",
  });

  // 清空pc
  const pcClear = () => {
    videoElem.value.srcObject = null;
    pcObj.pc = null;
    pcObj.sendChannel = null;
    pcObj.stream = null;
  };

  // 重置pc
  const pcReload = () => {
    pcClear();

    let stream = new MediaStream();
    pcObj.stream = stream;

    let config = {
      iceServers: [
        {
          urls: ["stun:stun.l.google.com:19302"],
        },
      ],
    };

    pcObj.pc = new RTCPeerConnection(config);
    pcObj.pc.onnegotiationneeded = handleNegotiationNeededEvent;

    pcObj.pc.ontrack = (event) => {
      pcObj.stream.addTrack(event.track);
      videoElem.value.srcObject = pcObj.stream;
      console.log(event.streams.length + " track is delivered");
    };

    pcObj.pc.oniceconnectionstatechange = (e) => {
      console.log(e);
      if (pcObj.pc !== null) {
        console.log(pcObj.pc.iceConnectionState);
      }
    };
  };

  const handleNegotiationNeededEvent = async () => {
    let offer = await pcObj.pc.createOffer();
    await pcObj.pc.setLocalDescription(offer);
    getRemoteSdp();
  };

  const getRemoteSdp = async () => {
    try {
      const sdpData = {
        suuid: pcObj.suuid,
        data: btoa(pcObj.pc.localDescription.sdp),
      };

      const result = await post(pcObj.receiverUrl + pcObj.suuid, sdpData);

      try {
        pcObj.pc.setRemoteDescription(
          new RTCSessionDescription({
            type: "answer",
            sdp: Buffer.from(result, "base64"),
          })
        );
      } catch (e) {
        console.warn(e);
      }
    } catch (error) {
      console.log("receiver请求失败", error);
    }
  };

  // 获取编解码
  const getCodecInfo = async () => {
    let result = await get(pcObj.codecUrl + pcObj.suuid);

    result.forEach((value) => {
      pcObj.pc.addTransceiver(value.Type, {
        direction: "sendrecv",
      });
    });

    pcObj.sendChannel = pcObj.pc.createDataChannel("foo");
    pcObj.sendChannel.onclose = () => console.log("sendChannel has closed");
    pcObj.sendChannel.onopen = () => {
      console.log("sendChannel has opened");
      pcObj.sendChannel.send("ping");
      let interval = setInterval(() => {
        if (pcObj.sendChannel === null) {
          clearInterval(interval);
        } else if (pcObj.sendChannel.readyState === "open") {
          pcObj.sendChannel.send("ping");
        }
      }, 1000);
    };

    pcObj.sendChannel.onmessage = (e) => console.log(e);
  };

  // 播放视频
  const playVideo = async () => {
    // 重置
    pcReload();
    // 清空
    console.log("pc状态：", pcObj.pc.connectionState);
    if (pcObj.pc.connectionState === "connected") {
      // 连接状态断开
      pcObj.pc.close();
      console.log("pc关闭后建立状态：", pcObj.pc.connectionState);
    }

    console.log("rtspUrl:", rstpUrl);

    let send_data = {
      rtspUrl: rstpUrl,
      disableAudio: disableAudio,
    };

    const result = await post(pcObj.registerUrl, send_data);

    try {
      if (result.code === 200) {
        pcObj.suuid = result.data;
        // 请求编解码
        getCodecInfo();
      }
    } catch (error) {
      console.warn("register 注册失败", error);
    }
  };

  // 全屏
  const fullScreen = () => {
    const videoElemValue = videoElem.value;

    // 适配各浏览器
    if (videoElemValue.requestFullscreen) {
      videoElemValue.requestFullscreen();
    } else if (videoElemValue.webkitRequestFullscreen) {
      videoElemValue.webkitRequestFullscreen();
    } else if (videoElemValue.mozRequestFullScreen) {
      videoElemValue.mozRequestFullScreen();
    }
  };

  // 检测全屏元素
  const checkFull = () => {
    var isFull =
      document.fullscreenElement ||
      document.mozFullScreenElement ||
      document.webkitFullscreenElement;
    //to fix : false || undefined == undefined
    if (isFull === undefined) isFull = false;
    return isFull;
  };

  return { playVideo, pcClear, videoElem, fullScreen, checkFull };
};

export default {
  name: "VideoPlayer",
  props: {
    rtspUrl: String,
    disableAudio: {
      type: Boolean,
      default: false,
    },
    play: {
      type: Boolean,
      default: true,
    },
    muted: {
      type: Boolean,
      default: false,
    },
    full: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { emit }) {
    const { playVideo, pcClear, videoElem, fullScreen, checkFull } =
      usePcObjEffect(props.rtspUrl, props.disableAudio);

    onMounted(() => {
      // 起始步骤
      if (props.rtspUrl === "" || props.rtspUrl === undefined) {
        return;
      }
      // 自动播放
      if (props.play) {
        playVideo();
      }

      // 全屏监听
      document.addEventListener("fullscreenchange", () => {
        if (!checkFull()) {
          console.log("退出全屏");
          emit("update:full", false);
        } else {
          console.log("进入全屏");
        }
      });
    });

    // 控制播放关闭
    watch(
      () => props.play,
      (newPlay) => {
        newPlay === true ? playVideo() : pcClear();
      }
    );

    // 静音开关
    watch(
      () => props.muted,
      (newMuted) => {
        newMuted === true
          ? (videoElem.value.muted = "muted")
          : (videoElem.value.muted = "");
      }
    );

    // 全屏开关
    watch(
      () => props.full,
      (newFull) => {
        if (newFull === true) {
          fullScreen();
        }
      }
    );

    return { playVideo, pcClear, videoElem };
  },
};
</script>

<style lang="scss" scoped>
video {
  width: 600px;
}
</style>