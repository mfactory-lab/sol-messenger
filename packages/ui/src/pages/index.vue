<template>
  <q-page>
    <div class="container">
      <div class="chat-wrapper">
        <q-card class="chat-card">
          <q-card-section>
            <q-input type="textarea" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.chat-wrapper {
  margin-top:2rem
}
.chat-card {
  max-width: 500px;
  margin: 0 auto;
}
</style>
