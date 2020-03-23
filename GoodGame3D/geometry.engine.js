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

class mesh{
    quads=[]
    vertices=[]
    indices=[]
    constructor(){
        
        //allocate and set buffer properites here
    }
    addQuad(q){
        this.quads.push(q)
    }

    clearQuads(){
        utils.clearArray(this.quads)
    }

    ///build the data for the arrays
    //we will actually have verticies in the shader that have 4 coordinateds
    build(){
        utils.clearArray(this.vertices)
        utils.clearArray(this.indices)

        for(var i=0;i<this.quads.length;i++){
            var currentQuad=this.quads[i];
            utils.extendArray(this.vertices,currentQuad.getData())
            utils.extendArray(this.indices,utils.offsetArray(i*6,[0,1,2,2,3,0]))
        }

        //do a buffer data command here
    }

    //gpuTools.drawMesh will bind buffers for this mesh and get the data from the mesh member variable

}