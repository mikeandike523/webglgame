//enum for vector properties
VectorProperties={orientation:{row:0,column:1}}

// all matrices use single dimensional arrays
// each consecuitve block of three values represents a new row (row major matrix)
// there will be mutating and copying versions of some functions, with copying versions being named in past tense
//      e.g. (translate vs translated)
// for now, no custom error types, simply throw a string with a message indicating the error that occured

class matrix{

    data=[]
    numRows=0
    numColumns=0

    constructor(numRows,numColumns){

        this.numRows=numRows;
        this.numColumns=numColumns;

        //construct the data with values all equal to 0
        for(var c=0;c<numRows*numColumns;c++){
            this.data.push(0)
        }

    }

    //set matrix values based off of an expression
    setData(lambda){
        for(var i=0;i<this.numRows;i++){
            for(var j=0;j<this.numColumns;j++){
                this.data[i*this.numColumns+j]=lambda(i,j);
            }
        }
        return this;
    }

    //read matrix values from an array
    fromArray(array){
        return this.setData((i,j)=>array[i*this.numColumns+j]);
    }

    //fill a matrix with a certain value, default 0
    fill(value){
        if(typeof value === 'undefined')
            value=0
        return this.setData((i,j)=>value);
    }

    //clear the matrix to 0
    clear(){
        return this.fill(0);
    }

    //set the matrix to the identity matrix
    identity(){
        return this.setData((i,j)=>i==j?1:0);
    }

    //deep-copy a matrix
    copy(){
        return new matrix(this.numRows,this.numColumns).fromArray(this.data);
    }

    //getter to get data as array
    getData(){
        return this.data;
    }

    //getters for dimensions
    getNumRows(){
        return this.numRows;
    }
    getNumColumns(){
        return this.numColumns
    }

    //assure index is valid
    assureValidIndex(i,j){
        if(i<0)
            throw `row index is invalid (<0) for index <${i},${j}>`;
        if(i>this.numRows-1)
            throw `row index is invalid (>numRows-1) for index <${i},${j}>`;
        if(j<0)
            throw `column index is invalid (<0) for index <${i},${j}>`;
        if(j<this.numColumns-1)
            throw `column index is invalid (>numColumns-1) for index <${i},${j}>`;
    }

    //assure a row index is valid
    assureValidRowIndex(i){
        if(i<0)
            throw `row index is invalid (<0) for index <${i},>`;
        if(i>this.numRows-1)
            throw `row index is invalid (>numRows-1) for index <${i},>`;
    }

    //assure a column index is valid
    assureValidColumnIndex(j){
        if(j<0)
            throw `column index is invalid (<0) for index <,${j}>`;
        if(j<this.numColumns-1)
            throw `column index is invalid (>numColumns-1) for index <,${j}>`;
    }

    //retrieve data from the matrix
    query(i,j){
        this.assureValidIndex();
        return this.data[this.numColumns*i+j];
    }

    //set a cell in the matrix
    setCell(i,j,value){
        this.assureValidIndex()
        this.data[this.numColumns*i+j]=value;
        return this;
    }

    //copy from a matrix
    fromMatrix(m){
        return this.setData((i,j)=>m.query(i,j))
    }

    //get a row slice as an array
    getRowSlice(i){
        var slice=[];
        for(var j=0;j<this.numColumns;j++){
            slice.push(this.query(i,j));
        }
        return slice;
    }


    //get a column slice as an array
    getColumnSlice(j){
        var slice=[];
        for(var i=0;i<this.numRows;i++){
            slice.push(this.query(i,j));
        }
        return slice;
    }

    //retrieve column vector from a matrix
    getColumn(j){
        this.assureValidColumnIndex();
        return new vector(this.numRows,VectorProperties.orientation.column).fromArray(this.getColumnSlice(j))
    }

    //retrieve row vector from a matrix
    getRow(i){
        this.assureValidRowIndex();
        return new vector(this.numColumns,VectorProperties.orientation.row).fromArray(this.getRowSlice(i))
    }

    
    translate(d){
        return this.setData((i,j)=>this.query(i,j)+d.query(i,j));
    }
    translated(d){
        return this.copy().translate(d)
    }
    scale(s){
        return this.setData((i,j)=>s*this.query(i,j));
    }
    scaled(s){
        return this.copy().scale(s)
    }
    elementByElementMultiply(m){
        return this.setData((i,j)=>this.query(i,j)*d.query(i,j))
    }
    elementByElementMultiplied(m){
        return this.copy().elementByElementMultiply(m);
    }
    transpose(){
        var transposedMatrix=this.transposed()
        var nR=this.numRows
        this.numRows=this.numColumns
        this.numColumns=nR
        return this.fromMatrix(transposedMatrix)
    }

    assureMultiplySizingValid(m){
        if(m.getNumRows()!=this.getNumColumns())
            throw `matrix sizing invalid for left matrix ${m.getNumRows()}x${m.getNumColumns()} and right matrix ${this.getNumRows()}x${this.getNumColumns()}
            (left matrix numRows must equal right matrix numColumns)
            `;
    }

    leftMultiply(m){
        var leftMultipliedByMatrix=this.leftMultipliedBy(m)
        this.numRows=m.numRows;
        return this.fromMatrix(leftMultipliedByMatrix)
    }

    transposed(){
        return new matrix(this.numColumns,this.numRows).setData((i,j)=>this.query(j,i))
    }

    leftMultipliedBy(m){
        this.assureMultiplySizingValid(m)
        return new matrix(m.numRows,this.numColumns).setData((i,j)=>m.getRow(i).dot(this.getColumn(j)));
    }
    

}

//class for specifically 4 by 4 matrix
class matrix4 extends matrix{
    constructor(data){
        if(typeof data == 'undefined')
        super(4,4)
        
        if(Array.isArray(data))
        {
            super(4,4)
            this.fromArray(data)
        }
    }
    copy(){
        return new matrix4(this.data);
    }


    //3d applications
    //note, opengl is column major, our system is row major and needs to be transposed into opengl
    //this can be done with the "transpose" argument set to true when using gl.uniformMatrix4fv

    //for now, we can exclude roll

    //used later for yaw
    getYRotationMatrix(angle){
        return new matrix4([
            Math.cos(angle),0,Math.sin(angle),0,
            0,1,0,0
            -Math.sin(angle),0,Math.cos(angle),0,
            0,0,0,1
        ]);
    }

    //used later for pitch
    getXRotationMatrix(angle){
        return new matrix4([
            1,0,0,0,
            0,Math.cos(angle),-Math.sin(angle),0,
            0,Math.sin(angle),Math.cos(angle),0,
            0,0,0,1
        ])
    }

    getScalingMatrix(s){ //vector3
        return new matrix4([
            s.getX(),0,0,0,
            0,s.getY(),0,0,
            0,0,s.getZ(),0,
            0,0,0,1
        ]);
    }

    getTranslationMatrix(d){ //vector3

        return new matrix4([
            1,0,0,d.getX(),
            0,1,0,d.getY(),
            0,0,1,d.getZ(),
            0,0,0,1

        ])

    }

    //recall, camera cooordinates are assumed -z, so we need a matrix to multiply flip z before projection
    //we will do so by using getScalingMatrix with 1,1,-1
    getProjectionMatrix(openingAngle,near,far,aspectRatio){
  
        return new matrix4([
            0.5/openingAngle,0,0,0,
            0,0.5*aspectRatio/openingAngle,0,0,
            0,0,-(far + near) / (far - near),(-2 * far * near) / (far - near),
            0,0,-1,0
        ]);
    }

    toXRotationMatrix(angle){
        return this.fromMatrix(this.getXRotationMatrix(angle));
    }
    toYRotationMatrix(angle){
        return this.fromMatrix(this.getYRotationMatrix(angle));
    }
    toProjectionMatrix(openingAngle,near,far,aspectRatio){
        return this.fromMatrix(this.getProjectionMatrix(openingAngle,near,far,aspectRatio));
    }
    toScalingMatrix(s){
        return this.fromMatrix(this.getScalingMatrix(s))
    }
    toTranslationMatrix(d){
        return this.fromMatrix(this.getTranslationMatrix(d))
    }

}


class vector extends matrix{

    //specify length and orientation of vector
    constructor(length,orientation){
        
        if(typeof orientation==='undefined')
            orientation=VectorProperties.orientation.row
        
        if(orientation===VectorProperties.orientation.row){
            super(1,length)
        }
        if(orientation===VectorProperties.orientation.column){
            super(length,1)
        }
        this.length=length
        this.orientation=orientation
    }

    assureValidIndex(k){
        if(k<0)
            throw `vector indexing error, index k<0 invalid for index <${k}>`
        if(k>this.length-1)
            throw `vector indexing error, k>length-1 invalid <${k}>`;
    }

    //get an array element
    getElement(k){
        this.assureValidIndex()
        if(this.orientation==VectorProperties.orientation.row){
            return this.query(0,k);
        }
        if(this.orientation==VectorProperties.orientation.column){
            return this.query(k,0);
        }
    }

    //set an array element
    setElement(){
        ithis.assureValidIndex()
        if(this.orientation==VectorProperties.orientation.row){
            this.setCell(0,k);
        }
        if(this.orientation==VectorProperties.orientation.column){
            this.setCell(k,0);
        }
    }

    //copy vector
    copy(){
        return new vector(this.length,this.orientation).fromArray(this.data);
    }

    //scalar quantities
    magnitude(){
        var total=0;
        for(var k=0;k<this.length;k++){
            total+=Math.pow(this.getElement(k),2)
        }
        return Math.sqrt(total);
    }
    dot(v){
        var total=0;
        for(var k=0;k<this.length;k++){
            total+=this.getElement(k)*v.getElement(k)
        }
        return total;
    }
    scalarProjection(base){
        return this.dot(base)/base.magnitude();
    }


    //mutating vector operations
    normalize(){
        return this.scale(1.0/this.magnitude());
    }



}

//vector3 assumed row vector
class vector3 extends vector{

    constructor(x,y,z){
        super(3,VectorProperties.orientation.row)
        this.fromArray([x,y,z]);
    }

    copy(){
        return new vector3(this.getElement(0),this.getElement(1),this.getElement(2));
    }

    setXYZ(x,y,z){
        this.fromArray(x,y,z);
    }
    
    setX(x){
        this.setElement(0,x);
    }

    setY(y){
        this.setElement(1,y);
    }

    setZ(z){
        this.setElement(2,z);
    }

    getX(){
        return this.getElement(0)
    }

    getY(){
        return this.getElement(1)
    }

    getZ(){
        return this.getElement(2)
    }

}

