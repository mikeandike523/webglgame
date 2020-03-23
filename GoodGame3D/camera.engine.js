class camera extends actor{

    constructor(position,yaw,pitch,openingAngle,near,far,aspectRatio){
        super(position,yaw,pitch)
        this.near=near
        this.far=far
        this.aspectRatio=aspectRatio
    }
     //here we account for the backwards z convention
     getViewMatrix(){
        var yRotation=this.yaw;
        var xRotation=-this.pitch;
        var yawMatrix=matrix4.getYRotationMatrix(yRotation);
        var pitchMatrix=matrix4.getXRotationMatrix(xRotation);
        var translationMatrix=matrix4.getTranslationMatrix(this.position.scaled(-1))
        return new matrix4().toIdentity().leftMultiply(zFlipper).leftMultiply(pitchMatrix).leftMultiply(yawMatrix).leftMultiply(translationMatrix);
    }
}