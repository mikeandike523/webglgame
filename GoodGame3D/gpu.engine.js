class gpuTools{
    static gl = undefined;
    static initOpenGLContext(){
        this.gl= document.getElementById("mainCanvas").getContext('experimental-webgl');
    }
}