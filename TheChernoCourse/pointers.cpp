#include <iostream>

#define LOG(x) std::cout << x << std::endl

int main() 
{
    // A: Saving a mem address in a var
    int var = 8;
    void* ptr = nullptr;
    // std::cin.get();  // prommpts for user input


    // B: Allocating Memory in the Heap (not the stack)
    char* buffer = new char[8];  // arr of size 8
    memset(buffer, 0, 8);  // setter function --> sets 8 values in the mem blocks to 0

    // C: a pointer that points to our pointer
    char** doublePointer = &buffer;

    // D: deleting memory on the heap
    delete[] buffer;
    return 0;
}