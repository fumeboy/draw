<template>
    <div id="app">
        <v-app id="inspire">
            <v-navigation-drawer app v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp">
                <div class="color-viewer" :style="'background-color: '+color_selector"></div>
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
                <div>
                    <div v-for="item in history" :key="item.i" class="color-viewer" @click="()=>setColor(item.v) " :style="'background-color: '+item.v">

                    </div>
                </div>
            </v-navigation-drawer>
            <v-app-bar
                    :clipped-left="$vuetify.breakpoint.lgAndUp"
                    app
                    color="blue darken-3"
                    dark
            >
                <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
                <v-toolbar-title
                        style="width: 300px"
                        class="ml-0 pl-4"
                >
                    <span class="hidden-sm-and-down">PIXEL DRAWER</span>
                </v-toolbar-title>
            </v-app-bar>
            <v-main style="background-color: rgba(241, 241, 241, 0.5)">
                <v-container
                        class="fill-height"
                        fluid
                >
                    <v-row
                            align="center"
                            justify="center"
                    >
                        <div id="canvas" ref="canvas"></div>
                    </v-row>
                    <div class="now-color">
                        <div class="pen">
                            <div class="color-box" :style="'background-color: '+penColor"></div>
                            <div class="bar">
                                <p><b>画笔颜色</b></p>
                                <p>{{penColor}}</p>
                            </div>
                        </div>
                    </div>
                      <div class="clear-btn">
                          <v-btn outlined color="secondary" dark @click="setColor(null)">
                              <v-icon>mdi-eraser</v-icon>
                              橡皮擦
                          </v-btn>
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
                <v-btn
                        color="pink"
                        dark
                        fab
                        depressed
                        @click="dialog4 = true"
                >
                    <v-icon>mdi-delete</v-icon>
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
                        </v-row>
                    </v-container>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                                text
                                color="primary"
                                @click="dialog = false"
                        >Cancel
                        </v-btn>
                        <v-btn
                                text
                                @click="()=>{dialog = false;exportt()}"
                        >Save
                        </v-btn>
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

                                笔刷颜色设置为空时，表示橡皮擦
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-card-actions>
                        <v-btn text @click="dialog2=false">OK</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog
                    persistent
                    v-model="dialog3"
                    width="800px"
            >
                <v-card>
                    <v-card-title>
                        选择画布大小
                    </v-card-title>
                    <v-container>
                        <v-row class="mx-2">
                            <v-col
                                    class="align-center justify-space-between"
                                    cols="12"
                            >
                                <v-text-field
                                        label="画布边长"
                                        v-model="canvas_size"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                    </v-container>
                    <v-card-actions>
                        <v-btn
                                text
                                color="primary"
                                @click="canvas_size = 64;set_size()"
                        >64 x 64</v-btn>
                        <v-btn
                                text
                                color="primary"
                                @click="canvas_size = 32;set_size()"
                        >32 x 32</v-btn>
                        <v-btn
                                text
                                color="primary"
                                @click="canvas_size = 8;set_size()"
                        >8 x 8</v-btn>
                        <v-spacer></v-spacer>
                        <v-btn
                                text
                                @click="()=>{set_size()}"
                        >Done
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-dialog
                    v-model="dialog4"
                    width="800px"
            >
                <v-card>
                    <v-card-title>
                        重建画布
                    </v-card-title>
                    <v-container>
                        危险行为需要二次确认
                    </v-container>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                                text
                                color="primary"
                                @click="dialog4 = false"
                        >Cancel
                        </v-btn>
                        <v-btn
                                text
                                color="red"
                                @click="()=>{dialog4 = false;dialog3 = true;}"
                        >Continue
                        </v-btn>
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
            drawer: null,
            fab: false,
            export_filename: "a1",
            cvs: null,
            penColor: "#000",
            bgColor: "#fff",
            color_selector: "#000",
            dialog: false,
            dialog2: false,
            dialog3: true,
            dialog4: false,
            history: [
                {v: '#000000', i: 0},
                {v: '#ff8888', i: 1},
                {v: '#49c163', i: 2},
                {v: '#4c7bc1', i: 3},
                {v: '#ffdd83', i: 4},
                {v: '#c457c2', i: 5},
                {v: '#ff7878', i: 6},
            ],
            canvas_size: 16,
        }),
        methods: {
            setColor(color) {
                this.cvs.SetColor(color)
                this.penColor = color
            },
            addColor() {
                this.history.push({v: this.color_selector, i: this.history.length})
            },
            exportt() {
                this.cvs.export(this.export_filename)
            },
            set_size(){
                this.dialog3 = false
                let canvas = this.$refs.canvas;
                this.cvs = new Run(canvas, this.canvas_size);
            }
        },
    };
</script>
<style scoped>
    #canvas {
        border: 1px solid #ddd;
    }

    .inputt {
        border-radius: 0;
        background: #eee;
    }

    .color-item{
        padding: 0;
    }

    .color-viewer {
        height: 2rem;
        width: 100%;
    }

    .clear-btn{
        position: absolute;
        left: 1rem;
        bottom: 1rem;
    }
    .now-color {
        position: absolute;
        left: 1rem;
        top: 1.5rem;
    }

    .now-color > div {
        display: grid;
        grid-template: 1fr/1fr 2fr;
        margin: 1rem 0;
    }

    .now-color .bar {
        display: flex;
        font-size: .9rem;
        height: 100%;
        justify-content: center;
        flex-direction: column;
    }

    .now-color .bar p {
        margin: 0;
    }

    .now-color .color-box {
        height: 3rem;
        width: 3rem;
        margin: 0 1rem;
        border: 1px solid #ddd;
    }
</style>
