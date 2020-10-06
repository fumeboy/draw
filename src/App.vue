<template>
  <div id="app">
      <v-app id="inspire">
        <v-navigation-drawer
                app
        >
            <v-text-field
                    flat
                    solo
                    filled
                    hide-details
                    prepend-inner-icon="mdi-pen"
                    :append-icon="'mdi-plus'"
                    @click:append="addColor"
                    background-color="#f1f1f1"
                    label="color"
                    v-model="color_selector"
            ></v-text-field>
            <div class="color-viewer" :style="'background-color: '+color_selector"></div>
            <div>
              <div v-for="item in history" :key="item.i" class="color-item">
                <v-btn class="color-box" small depressed :style="'background-color: '+item.v"></v-btn>
                <v-btn text small @click="()=>setBgColor(item.v)">Background</v-btn>
                <v-btn text small @click="()=>setColor(item.v)">Pen</v-btn>
              </div>
            </div>
        </v-navigation-drawer>
        <v-main style="background-color: rgba(241, 241, 241, 0.5)">
          <v-container
                  class="fill-height"
                  fluid
          >
            <v-row
                    align="center"
                    justify="center"
            >
              <canvas id="canvas" ref="canvas"></canvas>
            </v-row>
            <div class="now-color">
              <div class="pen">
                <div class="color-box" :style="'background-color: '+penColor"></div>
                <div class="bar">
                  <p> <b>画笔颜色</b> </p>
                  <p>{{penColor}}</p>
                </div>
              </div>
              <div class="bg">
                <div class="color-box" :style="'background-color: '+bgColor"></div>
                <div class="bar">
                  <p> <b> 背板颜色</b> </p>
                  <p>{{bgColor}}</p>
                </div>
              </div>
            </div>
          </v-container>
        </v-main>
        <v-speed-dial
                bottom
                right
                fixed
                v-model="fab"
        >
          <template v-slot:activator>
          <v-btn
                  v-model="fab"
                  color="pink"
                  dark
                  depressed
                  fab
          >
            <v-icon v-if="fab">mdi-close</v-icon>
            <v-icon v-else>mdi-plus</v-icon>
          </v-btn>
          </template>
          <v-btn
                  color="pink"
                  dark
                  fab
                  depressed
                  @click="dialog = !dialog"
          >
            <v-icon>mdi-export</v-icon>
          </v-btn>
          <v-btn
                  color="pink"
                  dark
                  fab
                  depressed
                  @click="dialog2 = true"
          >
            <v-icon>mdi-help</v-icon>
          </v-btn>
        </v-speed-dial>
        <v-dialog
                v-model="dialog"
                width="800px"
        >
          <v-card>
            <v-card-title>
               导出图片
            </v-card-title>
            <v-container>
              <v-row class="mx-2">
                <v-col
                        class="align-center justify-space-between"
                        cols="12"
                >
                    <v-text-field
                            label="文件名"
                            v-model="export_filename"
                    ></v-text-field>
                </v-col>
<!--                <v-col cols="6">-->
<!--                  <v-text-field-->
<!--                          label="导出大小 (16 x 16 的倍数 )"-->
<!--                          v-model="export_size"-->
<!--                  ></v-text-field>-->
<!--                </v-col>-->
              </v-row>
            </v-container>
            <v-card-actions>
              <v-btn
                      text
                      color="primary"
              >More</v-btn>
              <v-spacer></v-spacer>
              <v-btn
                      text
                      color="primary"
                      @click="dialog = false"
              >Cancel</v-btn>
              <v-btn
                      text
                      @click="()=>{dialog = false;exportt()}"
              >Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog
                width="800px"
                v-model="dialog2"
        >
          <v-card>
            <v-card-title>
              说明
            </v-card-title>
            <v-container>
              <v-row class="mx-2">
                <v-col
                        class="align-center justify-space-between"
                        cols="12"
                >
                  本网页程序应当在PC端使用。
                  左侧是调色器以及色彩板，可以选择笔刷颜色和背景颜色
                  （导出图片时，背景颜色不显示）
                </v-col>
              </v-row>
            </v-container>
            <v-card-actions>
              <v-btn text @click="dialog2=false">OK</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-app>
  </div>
</template>

<script>
import {Run} from './draw.js'
export default {
  name: 'App',
  data: () => ({
    fab: false,
    export_filename:"a1",
    cvs: null,
    penColor: "#000",
    bgColor: "#fff",
    color_selector: "#000",
    dialog: false,
    dialog2: false,
    history: [
      {v:'#000000',i:0},
      {v:'#123456',i:1}
    ],
  }),
  methods:{
    setColor(color){
      this.cvs.SetColor(color)
      this.penColor = color
    },
    setBgColor(color){
      this.bgColor = color
      this.cvs.bgColor = color
      this.cvs.drawBg()
    },
    addColor(){
      this.history.push({v:this.color_selector, i:this.history.length})
    },
    exportt(){
      this.cvs.export(this.export_filename)
    },
  },
  mounted() {
    let canvas = this.$refs.canvas;
    this.cvs = new Run(canvas);
  }
};
</script>
<style scoped>
  #canvas{
    border: 1px solid #ddd;
  }
  .inputt {
    border-radius: 0;
    background: #eee;
  }
  .color-viewer{
    height: 2rem;
    width: 100%;
  }
  .color-item{
    display: flex;
    margin: 1rem 0 0 1rem;
    padding: 0.1rem;
    border: 1px solid #f1f1f1;
  }
  .color-item button{
    /*width: 30%;*/
    color: #000
  }
  .color-item .color-box{
    /*height: 2rem;*/
    width: 20%;
  }
   .now-color{
      position: absolute;
     left: 1rem;
     bottom: 1rem;
   }
   .now-color > div{
     display: grid;
     grid-template: 1fr/1fr 2fr;
     margin: 1rem 0;
   }
   .now-color .bar{
     display: flex;
     font-size: .9rem;
     height: 100%;
     justify-content: center;
     flex-direction: column;
   }
  .now-color .bar p{
    margin: 0;
  }
    .now-color .color-box{
      height: 3rem;
      width: 3rem;
      margin: 0 1rem;
      border: 1px solid #ddd;
    }
</style>
