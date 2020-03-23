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

    //here we account for the backwards z convention
    getViewMatrix(){
        var yRotation=this.yaw;
        var xRotation=-this.pitch;
        var yawMatrix=new matrix4().toYRotationMatrix(yRotation);
       
        var pitchMatrix=new matrix4().toXRotationMatrix(xRotation);
        var translationMatrix=new matrix4().toTranslationMatrix(this.position.scaled(-1))
        console.log(translationMatrix)
        return new matrix4().identity().leftMultiply(zFlipper).leftMultiply(pitchMatrix).leftMultiply(yawMatrix).leftMultiply(translationMatrix);
    }

}