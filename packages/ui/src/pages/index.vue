<template>
  <q-page>
    <div class="container">
      <div class="messenger-container">
        <messenger />
      </div>
    </div>
    <div class="container">
      <app-service-info />
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.messenger-container {
  margin-top: 2rem
}

.q-page {
  position: relative;
  padding-top:60px;

  &:before {
    position: absolute;
    background: $primary;
    height: 275px;
    width: 100%;
    top: 0;
    left: 0;
    content: "";
    z-index: -1;
  }
}
</style>
