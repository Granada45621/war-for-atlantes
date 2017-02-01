function Vector( x, y ){
    this.x = x;
    this.y = y;
}
Vector.prototype.Set = function( x, y ){
    this.x = x;
    this.y = y;
    return this;
}
Vector.prototype.Sub = function( x, y ){
    this.x -= x;
    this.y -= y;
    return this;
}
Vector.prototype.Add = function( x, y ){
    this.x += x;
    this.y += y;
    return this;
}
Vector.prototype.Mul = function( x, y ){
    this.x *= x;
    this.y *= y;
    return this;
}
Vector.prototype.Div = function( x, y ){
    this.x /= x;
    this.y /= y;
    return this;
}
Vector.prototype.VecAdd = function( vec ){
    this.x += vec.x;
    this.y += vec.y;
    return this;
}
Vector.prototype.VecSub = function( vec ){
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
}
Vector.prototype.VecMul = function( vec ){
    this.x *= vec.x;
    this.y *= vec.y;
    return this;
}
Vector.prototype.VecDiv = function( vec ){
    this.x /= vec.x;
    this.y /= vec.y;
    return this;
}
Vector.prototype.Random = function( xmin, xmax, ymin, ymax ){
    this.x = Math.floor( Math.random() * ( xmax - xmin ) ) + xmin;
    this.y = Math.floor( Math.random() * ( ymax - ymin ) ) + ymin;
    return this;
}
Vector.prototype.Clone = function(){
    return new Vector( this.x, this.y );
}
Vector.prototype.Move = function( speed, direction ){
    this.x += ( (speed) * ( Math.cos(direction * Math.PI / 180) ) );
    this.y += ( (speed) * ( Math.sin(direction * Math.PI / 180) ) );
    return this;
}
Vector.prototype.MoveCos = function( speed, direction ){
    this.x += ( (speed) * ( Math.cos(direction * Math.PI / 180) ) );
    return this;
}
Vector.prototype.MoveSin = function( speed, direction ){
    this.y += ( (speed) * ( Math.sin(direction * Math.PI / 180) ) );
    return this;
}
Vector.prototype.GetDist = function( vec ){
    return Math.hypot( this.x - vec.x, this.y - vec.y );
}
Vector.prototype.GetDirection = function( vec ){
    return Math.atan2( vec.y - this.y, vec.x - this.x );;
}
Vector.prototype.CheckRange = function( xmin, xmax, ymin, ymax ){
    return ( this.x >= xmin && this.x < xmax && this.y >= ymin && this.y < ymax );
}
Vector.prototype.CheckSame = function( vec ){
    if( this.x == vec.x && this.y == vec.y ){ return true; }
    return false;
}
Vector.prototype.ToString = function(){
    return this.x+" "+this.y;
}
Vector.prototype.ToInt = function(){
    this.x = Math.floor( this.x );
    this.y = Math.floor( this.y );
    return this;
}

try {
    module.exports = Vector;
} catch(e){
    var a;
}
