class testObject{
    //lit only by depth
   //only one mesh, no materials
   //it has only one root coord system defined by the actor, i.e. one model matrix

    constructor(actor,mesh){
        this.actor=actor;
        this.mesh=mesh; //the mesh will store its vertex buffers and set its attributes
    }

    //draw self
    //depth testing rules and shader
    draw(){
        gpuTools.setModelMatrix(this.actor.getModelMatrix())
        gpuTools.useTestProgram()
        gpuTools.useDefaultDrawingPipeline() //sometime in the program, a static variable for camera has to be set before this function can be called
        gpuTools.drawMesh(this.mesh)
    }
   
}