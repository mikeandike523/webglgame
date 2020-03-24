class object{
   constructor(objectMesh,materialId,rootActor){
     this.objectMesh=objectMesh;
     this.materialId=materialId;
     this.rootActor=rootActor;
   }
   draw(){
    gpuTools.setModelMatrix(this.rootActor.getModelMatrix());
    gpuTools.bindMeshForDrawing(this.objectMesh);
    gpuTools.materialedDraw(this.materialId); //default drawing pipeline
   }
}