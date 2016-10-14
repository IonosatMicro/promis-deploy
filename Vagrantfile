#
# Copyright 2016 Space Research Institute of NASU and SSAU (Ukraine)
#
# Licensed under the EUPL, Version 1.1 or – as soon they
# will be approved by the European Commission - subsequent
# versions of the EUPL (the "Licence");
# You may not use this work except in compliance with the
# Licence.
# You may obtain a copy of the Licence at:
#
# https://joinup.ec.europa.eu/software/page/eupl
#
# Unless required by applicable law or agreed to in
# writing, software distributed under the Licence is
# distributed on an "AS IS" basis,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
# express or implied.
# See the Licence for the specific language governing
# permissions and limitations under the Licence.
#

# Vagrant 1.8 required for docker and no parallel setting
Vagrant.require_version ">= 1.8.0"

# Prevent parallel setup, we need this for links
ENV['VAGRANT_NO_PARALLEL'] = 'yes'

# Inspiration drawn from: http://blog.scottlowe.org/2015/02/11/multi-container-docker-yaml-vagrant/
require 'yaml'

# Default options
conf = YAML.load_file('conf/defaults.yml')

# Overrides with user-defined options
if File.file?('conf/conf.yml')
  YAML.load_file('conf/conf.yml').each do |override|
    conf[override[0]] = override[1]
  end
end

# Container definitions
containers = YAML.load_file('conf/containers.yml')

Vagrant.configure("2") do |config|
  # Using vagrant's nonsecure keypair
  # This only matters on non-Linux machines so who cares
  # TODO: this doesn't seem to work though
  config.ssh.insert_key = false

  containers.each do |container|
    config.vm.define container["name"] do |node|
      # Removing the default folder sync
      node.vm.synced_folder ".", "/vagrant", disabled: true

      # Adding custom ones
      if container["sync"]
        container["sync"].each do |sync|
          node.vm.synced_folder sync[0], sync[1]
        end
      end

      # Setting docker stuff
      node.vm.provider "docker" do |docker|
        # Pick up whether we need to build or reuse an image
        if container["image"]
          docker.image = container["image"]
        elsif container["build"]
          docker.build_dir = container["build"]
        end
        # Forward ports if necessary
        if container["ports"]
          docker.ports = container["ports"]
        end
        # Link other containers
        if container["link"]
          container["link"].each do |link|
            docker.link(link)
          end
        end
        # Set up environment vars
        if container["env"]
          container["env"].each do |env|
            docker.env[env[0]] = env[1]
          end
        end
        docker.name = container["name"]
      end
    end
  end
end
