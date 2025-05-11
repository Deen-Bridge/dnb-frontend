"use client";
import React from 'react';
import styled from 'styled-components';

const Loader = () => {
  return (
    <div className='flex justify-center items-center h-screen'>


      <StyledWrapper>
        <div className="loader">
          <div className="dot" />
          <div className="dot" />
          <div className="dot" />
        </div>
      </StyledWrapper>
    </div>
  );
}
const StyledWrapper = styled.div`
  .loader {
    width: 200px;
    height: 200px;
    perspective: 200px;
  }

  .dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120px;
    height: 120px;
    margin-top: -60px;
    margin-left: -60px;
    border-radius: 100px;
    border: 40px outset #092601;
    transform-origin: 50% 50%;
    transform: rotateX(24deg) rotateY(20deg) rotateZ(0deg) translateZ(-25px);
    background-color: transparent;
    animation: dot1 1000ms cubic-bezier(.49,.06,.43,.85) infinite;
  }

  .dot:nth-child(2) {
    width: 140px;
    height: 140px;
    margin-top: -70px;
    margin-left: -70px;
    border-width: 30px;
    border-color: #009900;
    animation-name: dot2;
    animation-delay: 75ms;
    box-shadow: inset 0 0 15px 0 rgba(0, 0, 0, 0.1);
  }

  .dot:nth-child(3) {
    width: 160px;
    height: 160px;
    margin-top: -80px;
    margin-left: -80px;
    border-width: 20px;
    border-color: #265902;
    animation-name: dot3;
    animation-delay: 150ms;
    box-shadow: inset 0 0 15px 0 rgba(0, 0, 0, 0.1);
  }

  @keyframes dot1 {
    0%, 100% {
      border-color: #092601;
    }
    50% {
      border-color: #008200;
      transform: rotateX(20deg) rotateY(20deg) rotateZ(50deg) translateZ(0px);
    }
  }

  @keyframes dot2 {
    0%, 100% {
      border-color: #009900;
      box-shadow: inset 0 0 15px 0 rgba(255, 255, 255, 0.2);
    }
    50% {
      border-color: #008200;
      box-shadow: inset 0 0 15px 0 rgba(0, 0, 0, 0.8);
      transform: rotateX(20deg) rotateY(20deg) rotateZ(50deg) translateZ(0px);
    }
  }

  @keyframes dot3 {
    0%, 100% {
      border-color: #265902;
    }
    50% {
      border-color: #008200;
      box-shadow: inset 0 0 15px 0 rgba(0, 0, 0, 0.8);
      transform: rotateX(20deg) rotateY(20deg) rotateZ(50deg) translateZ(0px);
    }
  }
`;


export default Loader;
