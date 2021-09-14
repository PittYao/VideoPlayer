# 工程介绍
视频播放

# 功能介绍
- [x] 播放摄像头rtsp
- [x] 播放编码器rtsp
- [x] 开关播放
- [x] 开关静音控制

# 文件说明
- 组件位置: @/components/VideoPlayer.vue
- 使用案例: @/views/Home.vue
- 后台访问地址: @/utils/request.js [baseURL]

# 组件说明

```vue
<video-player
    v-for="(item, index) in rtspList"
    :key="index"
 	  :rtspUrl="item.rtspUrl"
    :disableAudio="item.disableAudio"
    :play="item.play"
    :muted="item.muted"
    :class="{ selected: item.selected }"
    @click="selectedVideoElem(index)"
>
<script>
export default {
	setup() {
        /* 
          参数说明：
            rtspUrl: 地址
            disableAudio: 硬件设备是否支持音频，编码器不支持=false,摄像头支持=true
            play: 是否自动播放 [默认播放=true]
            selected: 选中状态 [添加边框]
            muted: 是否静音 [默认不静音=false]
        */
    	const rtspList = ref([
            	{
                  rtspUrl: "rtsp://admin:cebon61332433@192.168.99.215",
                  disableAudio: false,
                  play: true,
                  selected: false,
                  muted: false,
                }
        ])
        
        return { rtspList }
    }
}
</script>
```


# 启动
- 控制台 yarn serve  
