// Every line of code that needs to be run is run inside a class
// Each application has an entry point, which is a method called main

class helloWorld {
    // public: anyone can access it
    // static: method can be run without creating an instance of the class containing the main method
    // voic: method doesn't return any value
    // main: the name of the method
    public static void main(String[]args){
        // println: prints a line of text to the screen
        // ' System' class and 'out' stream are used to access the println method
        System.out.println("Hello World");
    }
}
