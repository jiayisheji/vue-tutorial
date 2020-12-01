<template>
  <div class="about">
    <h1>This is an about page</h1>
    <p @click="$store.commit('add')">sync：{{$store.state.count}}</p>
    <p @click="$store.dispatch('add')">async：{{$store.state.count}}</p>
    <p @click="$store.dispatch('add2')">async2：{{$store.state.count}}</p>
    <p>doubleCounter：{{$store.getters.doubleCounter}}</p>
  </div>
</template>
