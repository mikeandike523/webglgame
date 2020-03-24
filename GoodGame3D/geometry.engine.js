//assume each row is a point in space
class quad extends matrix4{

    constructor(a,b,c,d){
        super()
        this.fromRowArray(a.getHomogenous(),b.getHomogenous(),c.getHomogenous(),d.getHomogenous())
    }

    getA(){
        return this.getRow(0)
    }

    getB(){
        return this.getRow(1)
    }

    getC(){
        return this.getRow(2)
    }

    getD(){
        return this.getRow(3)
    }

}

//includes gpuTools calls
class mesh{
    quads=[]
    vertices=[]
    indices=[]
   
    constructor(){
        var ids = gpuTools.allocateAndInitMesh(); //this will also set vertex attrib pointer
        this.vertexArrayId=ids.vao;
        this.vertexBufferId=ids.vbo;
    }
    addQuad(q){
        this.quads.push(q)
    }

    clearQuads(){
        utils.clearArray(this.quads)
    }

    ///build the data for the arrays
    build(){
        utils.clearArray(this.vertices)
        utils.clearArray(this.indices)
        for(var i=0;i<this.quads.length;i++){
            var currentQuad=this.quads[i];
            utils.extendArray(this.vertices,currentQuad.getData())
            utils.extendArray(this.indices,utils.offsetArray(i*6,[0,1,2,2,3,0]))
        }
    }

    loadToGPU(){
        gpuTools.loadMeshData(this.vertexArrayId,this.vertexBufferId)
    }

}