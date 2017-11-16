<template>
  <v-app>
    <v-navigation-drawer
      persistent
      :clipped=true
      v-model="drawer"
      width=250
      app
    >
      <v-list>
              <v-list-tile :to="{ path: '/' }">
                <v-list-tile-action>
                  <v-icon>home</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title><h5>Dashboard</h5></v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
        <v-list-group v-for="item in items" :value="item.active" v-bind:key="item.title">
              <v-list-tile slot="item">
                <v-list-tile-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-icon>keyboard_arrow_down</v-icon>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile v-for="subMenu in item.submenu" v-bind:key="subMenu.title" :to="{ path: subMenu.action }">
                <v-list-tile-content>
                  <v-list-tile-title>{{ subMenu.title }}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <!-- TOP MENU -->
    <v-toolbar fixed app :clipped-left="true">
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title v-text="title" :to="{ path: '/' }"></v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <!-- END TOP MENU -->
    <!-- router view content -->
    <main>
      <v-content>
        <v-container fluid>
          <v-slide-y-transition mode="out-in">
            <v-layout column align-center>
              <router-view/>
            </v-layout>
          </v-slide-y-transition>
        </v-container>
      </v-content>
    </main>
    <!-- END router view content -->
    <!-- Footer -->
    <v-footer :fixed="true" app>
      <span>&copy; 2017</span>
    </v-footer>
    <!-- END Footer -->
  </v-app>
</template>

<script>
import MenuItems from './json.config/MenuItems.json'

export default {
  data() {
    return {
      drawer: true,
      items: MenuItems,
      right: true,
      rightDrawer: false,
      title: "Vuetify.js"
    };
  }
};
</script>
