//useful to have as global
var zFlipper=new matrix4().toScalingMatrix(new vector3(1,1,-1));
class actor{

    //+ yaw is to the right (+x)
    //+pitch is up (+y)
    constructor(position,yaw,pitch){
        this.position=position;
        this.yaw=yaw;
        this.pitch=pitch;
    }

    getModelMatrix(){
        var yRotation=-this.yaw;
        var xRotation=this.pitch;
        var yawMatrix=matrix4.getYRotationMatrix(yRotation);
        var pitchMatrix=matrix4.getXRotationMatrix(xRotation);
        var translationMatrix=matrix4.getTranslationMatrix(this.position)
        return new matrix4().toIdentity().leftMultiply(translationMatrix).leftMultiply(pitchMatrix).leftMultiply(yawMatrix);
    }
   
}