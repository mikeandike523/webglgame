class utils{
    static extendArray(target,by){
        for(var i=0;i<by.length;i++){
            target.push(by[i])
        }
    }
    static clearArray(target){
        while(target.length>0)
            target.pop()
    }
    static offsetArray(amount,target){
        for(var i=0;i<target.length;i++){
            target[i]+=amount
        }
    }
}