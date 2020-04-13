#include <SDL2/SDL.h>
#include <SDL2/SDL_audio.h>

#include <emscripten.h>
#include <emscripten/bind.h>

#include <stdio.h>
#include <string>
#include "PdBase.hpp"

using namespace emscripten;

void audio(void *userdata, Uint8 *stream, int len)
{
  float inbuf[64], outbuf[64][2];
  float *b = (float *) stream;
  int m = len / sizeof(float) / 2;
  int k = 0;
  while (m > 0)
  {
    for (int i = 0; i < 64; ++i)
      inbuf[i] = 0;
    libpd_process_float(1, &inbuf[0], &outbuf[0][0]);
    for (int i = 0; i < 64; ++i)
      for (int j = 0; j < 2; ++j)
        b[k++] = outbuf[i][j];
    m -= 64;
  }
  if (m < 0)
  {
    fprintf(stderr, "buffer overflow, m went negative: %d\n", m);
  }
}

int sendBang(const std::string &recv) {
    return libpd_bang(recv.c_str());
}

int sendFloat(const std::string &recv, float f) {
    return libpd_float(recv.c_str(), f);
}

int sendSymbol(const std::string &recv, const std::string &s) {
    return libpd_symbol(recv.c_str(), s.c_str());
}

int startMessage(int maxlen) {
    return libpd_start_message(maxlen);
}

void addFloat(float f) {
    libpd_add_float(f);
}

void addSymbol(const std::string &s) {
    libpd_add_symbol(s.c_str());
}

int finishList(const std::string &recv) {
    return libpd_finish_list(recv.c_str());
}

int finishMessage(const std::string &recv, const std::string &msg) {
    return libpd_finish_message(recv.c_str(), msg.c_str());
}

EMSCRIPTEN_BINDINGS(my_module) {
    function("sendBang", &sendBang);
    function("sendFloat", &sendFloat);
    function("sendSymbol", &sendSymbol);
    function("startMessage", &startMessage);
    function("addFloat", &addFloat);
    function("addSymbol", &addSymbol);
    function("finishList", &finishList);
    function("finishMessage", &finishMessage);
}

void pdprint(const char *s) {
    printf("%s", s);
}

void main1(void)
{
  // nop
}

int main(int argc, char **argv)
{
    // initialize SDL2 audio
    SDL_Init(SDL_INIT_AUDIO);
    SDL_AudioSpec want, have;
    want.freq = 44100;
    want.format = AUDIO_F32;
    want.channels = 2;
    want.samples = 512;
    want.callback = audio;
    SDL_AudioDeviceID dev = SDL_OpenAudioDevice(NULL, 0, &want, &have, SDL_AUDIO_ALLOW_ANY_CHANGE);
    printf("want: %d %d %d %d\n", want.freq, want.format, want.channels, want.samples);
    printf("have: %d %d %d %d\n", have.freq, have.format, have.channels, have.samples);

    // initialize libpd
    libpd_set_printhook(pdprint);
    libpd_init();
    libpd_init_audio(0, 2, have.freq);

    // compute audio    [; pd dsp 1(
    libpd_start_message(1); // one entry in list
    libpd_add_float(1.0f);
    libpd_finish_message("pd", "dsp");

    // open patch       [; pd open file folder(
    libpd_add_to_search_path("pd");
    libpd_openfile("pd/main.pd", ".");

    // start audio processing
    SDL_PauseAudioDevice(dev, 0);
    emscripten_set_main_loop(main1, 60, 1);
    return 0;
}
